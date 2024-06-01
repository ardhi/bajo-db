import resolveMethod from '../../../lib/resolve-method.js'
import handleAttachmentUpload from '../../../lib/handle-attachment-upload.js'

async function remove (name, id, opts = {}) {
  const { runHook, print } = this.bajo.helper
  const { pickRecord, collExists, sanitizeId } = this.bajoDb.helper
  const { clearColl } = this.bajoDb.cache ?? {}
  const { cloneDeep } = this.bajo.helper._
  const options = cloneDeep(opts)
  options.dataOnly = options.dataOnly ?? true
  const { fields, dataOnly, noHook, noResult, hidden } = options
  options.dataOnly = false
  await collExists(name, true)
  const { handler, schema } = await resolveMethod.call(this, name, 'record-remove')
  id = sanitizeId(id, schema)
  if (!noHook) {
    await runHook('bajoDb:onBeforeRecordRemove', name, id, options)
    await runHook(`bajoDb.${name}:onBeforeRecordRemove`, id, options)
  }
  const record = await handler.call(this, { schema, id, options })
  if (options.req) {
    if (options.req.file) await handleAttachmentUpload.call(this, { name: schema.name, id, options, action: 'remove' })
    if (options.req.flash) options.req.flash('dbsuccess', { message: print.__('Record successfully removed', { ns: 'bajoDb' }), record })
  }
  if (!noHook) {
    await runHook(`bajoDb.${name}:onAfterRecordRemove`, id, options, record)
    await runHook('bajoDb:onAfterRecordRemove', name, id, options, record)
  }
  if (clearColl) await clearColl({ coll: name, id, options, record })
  if (noResult) return
  record.oldData = await pickRecord({ record: record.oldData, fields, schema, hidden })
  return dataOnly ? record.oldData : record
}

export default remove
