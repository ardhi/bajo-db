import buildRecordAction from '../../../lib/build-record-action.js'
import checkUnique from '../../../lib/check-unique.js'
import handleAttachmentUpload from '../../../lib/handle-attachment-upload.js'

async function update (name, id, body, options = {}) {
  const { runHook, importPkg, print } = this.bajo.helper
  const { pickRecord, sanitizeBody, collExists, validate } = this.bajoDb.helper
  const { get, keys } = await importPkg('lodash-es')
  const { fields, dataOnly = true, skipHook, skipValidation, ignoreHidden } = options
  await collExists(name, true)
  if (!skipValidation) {
    if (!skipHook) {
      await runHook('bajoDb:onBeforeRecordValidation', name, body, options)
      await runHook(`bajoDb.${name}:onBeforeRecordValidation`, body, options)
    }
    const { validation = {} } = options
    validation.fields = keys(body)
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
  const { handler, schema } = await buildRecordAction.call(this, name, 'update')
  if (!skipHook) {
    await runHook('bajoDb:onBeforeRecordUpdate', name, id, body, options)
    await runHook(`bajoDb.${name}:onBeforeRecordUpdate`, id, body, options)
  }
  for (const f in schema.feature) {
    if (!schema.feature[f]) continue
    const beforeUpdate = get(this.bajoDb, `feature.${f}.hook.beforeUpdate`)
    if (beforeUpdate) await beforeUpdate.call(this, { schema, body })
  }
  const newBody = await sanitizeBody({ body, schema, partial: true })
  delete newBody.id
  await checkUnique.call(this, { schema, body: newBody, id })
  let record
  try {
    record = await handler.call(this, { schema, id, body: newBody, options })
    if (options.req) {
      if (options.req.file) await handleAttachmentUpload.call(this, { name: schema.name, id, body: newBody, options, action: 'update' })
      if (options.req.flash) options.req.flash('dbsuccess', { message: print.__('Record successfully updated', { ns: 'bajoDb' }), record })
    }
  } catch (err) {
    if (get(options, 'req.flash')) options.req.flash('dberr', err)
    throw err
  }
  if (!skipHook) {
    await runHook(`bajoDb.${name}:onAfterRecordUpdate`, id, newBody, options, record)
    await runHook('bajoDb:onAfterRecordUpdate', name, id, newBody, options, record)
  }
  record.oldData = await pickRecord({ record: record.oldData, fields, schema, ignoreHidden })
  record.data = await pickRecord({ record: record.data, fields, schema, ignoreHidden })
  return dataOnly ? record.data : record
}

export default update
