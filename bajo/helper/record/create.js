import buildRecordAction from '../../../lib/build-record-action.js'
import checkUnique from '../../../lib/check-unique.js'
import handleAttachmentUpload from '../../../lib/handle-attachment-upload.js'
import execValidation from '../../../lib/exec-validation.js'

async function create (name, input, options = {}) {
  const { generateId, runHook, importPkg, print } = this.bajo.helper
  const { pickRecord, sanitizeBody, collExists } = this.bajoDb.helper
  const { get, find, forOwn } = await importPkg('lodash-es')
  const { fields, dataOnly = true, skipHook, skipValidation, ignoreHidden } = options
  await collExists(name, true)
  const { handler, schema } = await buildRecordAction.call(this, name, 'create', options)
  let body = await sanitizeBody({ body: input, schema, strict: true })
  const idField = find(schema.properties, { name: 'id' })
  if (idField.type === 'string') body.id = body.id ?? generateId()
  if (!skipValidation) body = await execValidation.call(this, { skipHook, name, body, options })
  if (!skipHook) {
    await runHook('bajoDb:onBeforeRecordCreate', name, body, options)
    await runHook(`bajoDb.${name}:onBeforeRecordCreate`, body, options)
  }
  for (const f in schema.feature) {
    if (!schema.feature[f]) continue
    const beforeCreate = get(this.bajoDb, `feature.${f}.hook.beforeCreate`)
    if (beforeCreate) await beforeCreate.call(this, { schema, body })
  }
  await checkUnique.call(this, { schema, body })
  let record
  try {
    const nbody = {}
    forOwn(body, (v, k) => {
      if (v !== undefined) nbody[k] = v
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
  if (!skipHook) {
    await runHook(`bajoDb.${name}:onAfterRecordCreate`, body, options, record)
    await runHook('bajoDb:onAfterRecordCreate', name, body, options, record)
  }
  record.data = await pickRecord({ record: record.data, fields, schema, ignoreHidden })
  return dataOnly ? record.data : record
}

export default create
