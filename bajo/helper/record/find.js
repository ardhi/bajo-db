import buildRecordAction from '../../../lib/build-record-action.js'

async function find (name, filter = {}, options = {}) {
  const { runHook } = this.bajo.helper
  const { pickRecord, collExists } = this.bajoDb.helper
  options.dataOnly = options.dataOnly ?? true
  const { fields, dataOnly, skipHook, ignoreHidden } = options
  await collExists(name, true)
  const { handler, schema } = await buildRecordAction.call(this, name, 'find')
  if (!skipHook) {
    await runHook('bajoDb:onBeforeRecordFind', name, filter, options)
    await runHook(`bajoDb.${name}:onBeforeRecordFind`, filter, options)
  }
  const records = await handler.call(this, { schema, filter, options })
  if (!skipHook) {
    await runHook(`bajoDb.${name}:onAfterRecordFind`, filter, options, records)
    await runHook('bajoDb:onAfterRecordFind', name, filter, options, records)
  }
  for (const idx in records.data) {
    records.data[idx] = await pickRecord({ record: records.data[idx], fields, schema, ignoreHidden })
  }
  return dataOnly ? records.data : records
}

export default find
