import buildRecordAction from '../../../lib/build-record-action.js'

async function get (name, id, options = {}) {
  const { runHook } = this.bajo.helper
  const { pickRecord, repoExists } = this.bajoDb.helper
  const { fields, dataOnly = true, skipHook } = options
  await repoExists(name, true)
  const { handler, schema } = await buildRecordAction.call(this, name, 'get')
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
  record.data = await pickRecord({ record: record.data, fields, schema })
  return dataOnly ? record.data : record
}

export default get
