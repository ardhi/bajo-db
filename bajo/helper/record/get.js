import buildRecordAction from '../../../lib/build-record-action.js'

async function get (name, id, options = {}) {
  const { error } = this.bajo.helper
  const { pickRecord } = this.bajoDb.helper
  const { fields, dataOnly } = options
  const { handler, existsHandler, schema } = await buildRecordAction.call(this, 'get', name)
  if (!await existsHandler.call(this, schema)) throw error('Collection doesn\'t exist yet. Please rebuild its model first')
  options.dataOnly = false
  const record = await handler.call(this, { schema, id, options })
  record.data = await pickRecord({ record: record.data, fields, schema })
  return dataOnly ? record.data : record
}

export default get
