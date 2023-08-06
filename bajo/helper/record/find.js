import buildRecordAction from '../../../lib/build-record-action.js'

async function find (name, filter, options = {}) {
  const { runHook } = this.bajo.helper
  const { pickRecord, repoExists } = this.bajoDb.helper
  const { fields, dataOnly = true } = options
  await repoExists(name, true)
  const { handler, schema } = await buildRecordAction.call(this, name, 'find')
  await runHook('bajoDb:beforeRecordFind' + name, filter, options)
  const records = await handler.call(this, { schema, filter, options })
  await runHook('bajoDb:afterRecordFind' + name, filter, options, records)
  for (const idx in records.data) {
    records.data[idx] = await pickRecord({ record: records.data[idx], fields, schema })
  }
  return dataOnly ? records.data : records
}

export default find
