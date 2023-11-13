import buildRecordAction from '../../../lib/build-record-action.js'

async function get (name, id, options = {}) {
  const { runHook } = this.bajo.helper
  const { pickRecord, collExists, sanitizeId } = this.bajoDb.helper
  options.dataOnly = options.dataOnly ?? true
  const { fields, dataOnly, skipHook, ignoreHidden } = options
  await collExists(name, true)
  const { handler, schema } = await buildRecordAction.call(this, name, 'get')
  id = sanitizeId(id, schema)
  options.dataOnly = false
  if (!skipHook) {
    await runHook('bajoDb:onBeforeRecordGet', name, id, options)
    await runHook(`bajoDb.${name}:onBeforeRecordGet`, id, options)
  }
  const record = await handler.call(this, { schema, id, options })
  if (!skipHook) {
    await runHook(`bajoDb.${name}:onAfterRecordGet`, id, options, record)
    await runHook('bajoDb:onAfterRecordGet', name, id, options, record)
  }
  record.data = await pickRecord({ record: record.data, fields, schema, ignoreHidden })
  return dataOnly ? record.data : record
}

export default get
