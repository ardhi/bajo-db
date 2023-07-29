import buildRecordAction from '../../../lib/build-record-action.js'

async function remove (name, id, options = {}) {
  const { pickRecord, collExists } = this.bajoDb.helper
  const { fields, dataOnly = true } = options
  await collExists(name, true)
  const { handler, schema } = await buildRecordAction.call(this, name, 'remove')
  const record = await handler.call(this, { schema, id, options })
  record.oldData = await pickRecord({ record: record.oldData, fields, schema })
  return dataOnly ? record.oldData : record
}

export default remove
