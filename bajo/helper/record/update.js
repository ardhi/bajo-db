import buildRecordAction from '../../../lib/build-record-action.js'
import checkUnique from '../../../lib/check-unique.js'
import handleAttachmentUpload from '../../../lib/handle-attachment-upload.js'
import execValidation from '../../../lib/exec-validation.js'

async function update (name, id, input, options = {}) {
  const { runHook, importPkg, print } = this.bajo.helper
  const { pickRecord, sanitizeBody, collExists } = this.bajoDb.helper
  const { get } = await importPkg('lodash-es')
  const { fields, dataOnly = true, skipHook, skipValidation, ignoreHidden } = options
  await collExists(name, true)
  const { handler, schema } = await buildRecordAction.call(this, name, 'update')
  let body = await sanitizeBody({ body: input, schema, partial: true, strict: true })
  delete body.id
  if (!skipValidation) body = await execValidation.call(this, { skipHook, name, body, options, partial: true })
  if (!skipHook) {
    await runHook('bajoDb:onBeforeRecordUpdate', name, id, body, options)
    await runHook(`bajoDb.${name}:onBeforeRecordUpdate`, id, body, options)
  }
  for (const f in schema.feature) {
    if (!schema.feature[f]) continue
    const beforeUpdate = get(this.bajoDb, `feature.${f}.hook.beforeUpdate`)
    if (beforeUpdate) await beforeUpdate.call(this, { schema, body })
  }
  await checkUnique.call(this, { schema, body, id })
  let record
  try {
    record = await handler.call(this, { schema, id, body, options })
    if (options.req) {
      if (options.req.file) await handleAttachmentUpload.call(this, { name: schema.name, id, body, options, action: 'update' })
      if (options.req.flash) options.req.flash('dbsuccess', { message: print.__('Record successfully updated', { ns: 'bajoDb' }), record })
    }
  } catch (err) {
    if (get(options, 'req.flash')) options.req.flash('dberr', err)
    throw err
  }
  if (!skipHook) {
    await runHook(`bajoDb.${name}:onAfterRecordUpdate`, id, body, options, record)
    await runHook('bajoDb:onAfterRecordUpdate', name, id, body, options, record)
  }
  record.oldData = await pickRecord({ record: record.oldData, fields, schema, ignoreHidden })
  record.data = await pickRecord({ record: record.data, fields, schema, ignoreHidden })
  return dataOnly ? record.data : record
}

export default update
