import buildRecordAction from '../../../lib/build-record-action.js'
import checkUnique from '../../../lib/check-unique.js'
import handleAttachmentUpload from '../../../lib/handle-attachment-upload.js'

async function create (name, body, options = {}) {
  const { generateId, runHook, importPkg, print } = this.bajo.helper
  const { pickRecord, sanitizeBody, collExists, validate } = this.bajoDb.helper
  const { get } = await importPkg('lodash-es')
  const { fields, dataOnly = true, skipHook, skipValidation, ignoreHidden } = options
  await collExists(name, true)
  if (!skipValidation) {
    if (!skipHook) {
      await runHook('bajoDb:onBeforeRecordValidation', name, body, options)
      await runHook(`bajoDb.${name}:onBeforeRecordValidation`, body, options)
    }
    const { validation = {} } = options
    try {
      body = await validate(body, name, validation)
    } catch (err) {
      if (err.code === 'DB_VALIDATION' && get(options, 'req.flash')) {
        options.req.flash('validation', err)
      }
      throw err
    }
    if (!skipHook) {
      await runHook('bajoDb:onAfterRecordValidation', name, body, options)
      await runHook(`bajoDb.${name}:onAfterRecordValidation`, body, options)
    }
  }
  const { handler, schema } = await buildRecordAction.call(this, name, 'create', options)
  if (!skipHook) {
    await runHook('bajoDb:onBeforeRecordCreate', name, body, options)
    await runHook(`bajoDb.${name}:onBeforeRecordCreate`, body, options)
  }
  for (const f in schema.feature) {
    if (!schema.feature[f]) continue
    const beforeCreate = get(this.bajoDb, `feature.${f}.hook.beforeCreate`)
    if (beforeCreate) await beforeCreate.call(this, { schema, body })
  }
  const newBody = await sanitizeBody({ body, schema })
  newBody.id = newBody.id ?? generateId()
  await checkUnique.call(this, { schema, body: newBody })
  let record
  try {
    record = await handler.call(this, { schema, body: newBody, options })
    if (options.req) {
      if (options.req.file) await handleAttachmentUpload.call(this, { name: schema.name, id: newBody.id, body: newBody, options, action: 'create' })
      if (options.req.flash) options.req.flash('dbsuccess', { message: print.__('Record successfully created', { ns: 'bajoDb' }), record })
    }
  } catch (err) {
    if (get(options, 'req.flash')) options.req.flash('dberr', err)
    throw err
  }
  if (!skipHook) {
    await runHook(`bajoDb.${name}:onAfterRecordCreate`, newBody, options, record)
    await runHook('bajoDb:onAfterRecordCreate', name, newBody, options, record)
  }
  record.data = await pickRecord({ record: record.data, fields, schema, ignoreHidden })
  return dataOnly ? record.data : record
}

export default create
