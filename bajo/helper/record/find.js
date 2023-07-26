import buildRecordAction from '../../../lib/build-record-action.js'

async function find (name, filter, options = {}) {
  const { error } = this.bajo.helper
  const { pickRecord } = this.bajoDb.helper
  const { fields } = options
  const { handler, existsHandler, schema } = await buildRecordAction.call(this, 'find', name)
  if (!await existsHandler.call(this, schema)) throw error('Collection doesn\'t exist yet. Please rebuild its model first')
  const records = await handler.call(this, { schema, filter, options })
  for (const idx in records) {
    records[idx] = await pickRecord({ record: records[idx], fields, schema })
  }
  return records
}

export default find
