import buildRecordAction from '../../../lib/build-record-action.js'

async function update (name, id, body, options = {}) {
  const { error } = this.bajo.helper
  const { pickRecord, sanitizeBody } = this.bajoDb.helper
  const { fields, dataOnly } = options
  const { handler, existsHandler, schema } = await buildRecordAction.call(this, 'update', name)
  if (!await existsHandler.call(this, schema)) throw error('Collection doesn\'t exist yet. Please rebuild its model first')
  const newBody = await sanitizeBody({ body, schema, partial: true })
  delete newBody.id
  const result = await handler.call(this, { schema, id, body: newBody, options })
  result.old = await pickRecord({ record: result.old, fields, schema })
  result.new = await pickRecord({ record: result.new, fields, schema })
  return dataOnly ? result.new : result
}

export default update
