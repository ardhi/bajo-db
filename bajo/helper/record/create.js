import buildRecordAction from '../../../lib/build-record-action.js'
import checkUnique from '../../../lib/check-unique.js'
import handleAttachmentUpload from '../../../lib/handle-attachment-upload.js'
import execValidation from '../../../lib/exec-validation.js'
import execFeatureHook from '../../../lib/exec-feature-hook.js'

async function create (name, input, options = {}) {
  const { generateId, runHook, importPkg, print, isSet } = this.bajo.helper
  const { pickRecord, sanitizeBody, collExists } = this.bajoDb.helper
  const { clearColl } = this.bajoDb.cache ?? {}
  const { get, find, forOwn, cloneDeep } = await importPkg('lodash-es')
  input = cloneDeep(input)
  options.dataOnly = options.dataOnly ?? true
  options.truncateString = options.truncateString ?? true
  const { fields, dataOnly, skipHook, skipValidation, ignoreHidden, skipCheckUnique } = options
  await collExists(name, true)
  const { handler, schema } = await buildRecordAction.call(this, name, 'create', options)
  const idField = find(schema.properties, { name: 'id' })
  if (idField.type === 'string') input.id = input.id ?? generateId()
  else if (idField.type === 'integer') input.id = input.id ?? generateId('int')
  let body = await sanitizeBody({ body: input, schema, strict: true })
  if (!skipHook) {
    await runHook('bajoDb:onBeforeRecordCreate', name, body, options)
    await runHook(`bajoDb.${name}:onBeforeRecordCreate`, body, options)
  }
  await execFeatureHook.call(this, 'beforeCreate', { schema, body })
  if (!skipValidation) body = await execValidation.call(this, { skipHook, name, body, options })
  if (!skipCheckUnique) await checkUnique.call(this, { schema, body })
  let record
  try {
    const nbody = {}
    forOwn(body, (v, k) => {
      if (v === undefined) return undefined
      const prop = find(schema.properties, { name: k })
      if (options.truncateString && isSet(v) && prop && ['string', 'text'].includes(prop.type)) v = v.slice(0, prop.maxLength)
      nbody[k] = v
    })
    record = await handler.call(this, { schema, body: nbody, options })
    if (options.req) {
      if (options.req.file) await handleAttachmentUpload.call(this, { name: schema.name, id: body.id, body, options, action: 'create' })
      if (options.req.flash) options.req.flash('dbsuccess', { message: print.__('Record successfully created', { ns: 'bajoDb' }), record })
    }
  } catch (err) {
    if (get(options, 'req.flash')) options.req.flash('dberr', err)
    throw err
  }
  await execFeatureHook.call(this, 'afterCreate', { schema, body, record })
  if (!skipHook) {
    await runHook(`bajoDb.${name}:onAfterRecordCreate`, body, options, record)
    await runHook('bajoDb:onAfterRecordCreate', name, body, options, record)
  }
  if (clearColl) await clearColl({ coll: name, body, options, record })
  record.data = await pickRecord({ record: record.data, fields, schema, ignoreHidden })
  return dataOnly ? record.data : record
}

export default create
