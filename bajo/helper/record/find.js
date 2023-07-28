import buildRecordAction from '../../../lib/build-record-action.js'

async function find (name, filter, options = {}) {
  const { error } = this.bajo.helper
  const { pickRecord } = this.bajoDb.helper
  const { fields, dataOnly = true } = options
  const { handler, existsHandler, schema } = await buildRecordAction.call(this, 'find', name)
  if (!await existsHandler.call(this, schema)) throw error('Collection doesn\'t exist yet. Please rebuild its model first')
  const records = await handler.call(this, { schema, filter, options })
  for (const idx in records.data) {
    records.data[idx] = await pickRecord({ record: records.data[idx], fields, schema })
  }
  return dataOnly ? records.data : records
}

export default find
