import resolveMethod from '../../../lib/resolve-method.js'
import checkUnique from '../../../lib/check-unique.js'
import handleAttachmentUpload from '../../../lib/handle-attachment-upload.js'
import execValidation from '../../../lib/exec-validation.js'
import execFeatureHook from '../../../lib/exec-feature-hook.js'

async function create (name, input, opts = {}) {
  const { generateId, runHook, print, isSet } = this.bajo.helper
  const { pickRecord, sanitizeBody, collExists } = this.bajoDb.helper
  const { clearColl } = this.bajoDb.cache ?? {}
  const { get, find, forOwn, cloneDeep } = this.bajo.helper._
  const options = cloneDeep(opts)
  options.dataOnly = options.dataOnly ?? true
  input = cloneDeep(input)
  const { fields, dataOnly, noHook, noValidation, noCheckUnique, noFeatureHook, noResult, noSanitize, hidden } = options
  options.truncateString = options.truncateString ?? true
  options.dataOnly = false
  await collExists(name, true)
  const { handler, schema } = await resolveMethod.call(this, name, 'record-create', options)
  const idField = find(schema.properties, { name: 'id' })
  if (!isSet(input.id)) {
    if (idField.type === 'string') input.id = generateId()
    else if (['integer', 'smallint'].includes(idField.type) && !idField.autoInc) input.id = generateId('int')
  }
  let body = noSanitize ? input : await sanitizeBody({ body: input, schema, strict: true })
  if (!noHook) {
    await runHook('bajoDb:onBeforeRecordCreate', name, body, options)
    await runHook(`bajoDb.${name}:onBeforeRecordCreate`, body, options)
  }
  if (!noFeatureHook) await execFeatureHook.call(this, 'beforeCreate', { schema, body })
  if (!noValidation) body = await execValidation.call(this, { noHook, name, body, options })
  if (isSet(body.id) && !noCheckUnique) await checkUnique.call(this, { schema, body })
  let record = {}
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
  if (!noFeatureHook) await execFeatureHook.call(this, 'afterCreate', { schema, body, record })
  if (!noHook) {
    await runHook(`bajoDb.${name}:onAfterRecordCreate`, body, options, record)
    await runHook('bajoDb:onAfterRecordCreate', name, body, options, record)
  }
  if (clearColl) await clearColl({ coll: name, body, options, record })
  if (noResult) return
  record.data = await pickRecord({ record: record.data, fields, schema, hidden })
  return dataOnly ? record.data : record
}

export default create
