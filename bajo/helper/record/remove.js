import buildRecordAction from '../../../lib/build-record-action.js'

async function remove (name, id, options = {}) {
  const { error } = this.bajo.helper
  const { pickRecord } = this.bajoDb.helper
  const { fields } = options
  const { handler, existsHandler, schema } = await buildRecordAction.call(this, 'remove', name)
  if (!await existsHandler.call(this, schema)) throw error('Collection doesn\'t exist yet. Please rebuild its model first')
  const record = await handler.call(this, { schema, id, options })
  return await pickRecord({ record, fields, schema })
}

export default remove
