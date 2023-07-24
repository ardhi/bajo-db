import buildRecordAction from '../../../lib/build-record-action.js'

async function get (name, id, options = {}) {
  const { handler, schema } = await buildRecordAction.call(this, 'get', name)
  return await handler.call(this, { schema, id, options })
}

export default get
