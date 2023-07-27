import buildRecordAction from '../../../lib/build-record-action.js'

async function create (name, body, options = {}) {
  const { generateId, error } = this.bajo.helper
  const { pickRecord, sanitizeBody } = this.bajoDb.helper
  const { fields, dataOnly } = options
  const { handler, existsHandler, schema } = await buildRecordAction.call(this, 'create', name)
  if (!await existsHandler.call(this, schema)) throw error('Collection doesn\'t exist yet. Please rebuild its model first')
  const newBody = await sanitizeBody({ body, schema })
  newBody.id = newBody.id || generateId()
  const record = await handler.call(this, { schema, body: newBody, options })
  record.data = await pickRecord({ record: record.data, fields, schema })
  return dataOnly ? record.data : record
}

export default create
