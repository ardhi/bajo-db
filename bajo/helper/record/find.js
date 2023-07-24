import buildRecordAction from '../../../lib/build-record-action.js'

async function find (name, filter, options = {}) {
  const { handler, schema } = await buildRecordAction.call(this, 'find', name)
  return await handler.call(this, { schema, filter, options })
}

export default find
