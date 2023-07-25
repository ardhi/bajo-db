import buildRecordAction from '../../../lib/build-record-action.js'

async function remove (name, id, options = {}) {
  const { pickRecord } = this.bajoDb.helper
  const { fields } = options
  const { handler, schema } = await buildRecordAction.call(this, 'remove', name)
  const record = await handler.call(this, { schema, id, options })
  return await pickRecord({ record, fields, schema })
}

export default remove
