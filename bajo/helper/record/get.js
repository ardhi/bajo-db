import buildRecordAction from '../../../lib/build-record-action.js'

async function get (name, id, options = {}) {
  const { pickRecord, repoExists } = this.bajoDb.helper
  const { fields, dataOnly = true } = options
  await repoExists(name, true)
  const { handler, schema } = await buildRecordAction.call(this, name, 'get')
  options.dataOnly = false
  const record = await handler.call(this, { schema, id, options })
  record.data = await pickRecord({ record: record.data, fields, schema })
  return dataOnly ? record.data : record
}

export default get
