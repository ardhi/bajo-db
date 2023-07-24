import buildRecordAction from '../../../lib/build-record-action.js'

async function remove (name, id, options = {}) {
  const { handler, schema } = await buildRecordAction.call(this, 'remove', name)
  return await handler.call(this, { schema, id, options })
}

export default remove
