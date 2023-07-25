import buildRecordAction from '../../../lib/build-record-action.js'

async function find (name, filter, options = {}) {
  const { pickRecord } = this.bajoDb.helper
  const { fields } = options
  const { handler, schema } = await buildRecordAction.call(this, 'find', name)
  const records = await handler.call(this, { schema, filter, options })
  for (const idx in records) {
    records[idx] = await pickRecord({ record: records[idx], fields, schema })
  }
  return records
}

export default find
