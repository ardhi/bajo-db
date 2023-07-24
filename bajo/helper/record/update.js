import buildRecordAction from '../../../lib/build-record-action.js'

async function update (name, id, body, options = {}) {
  const { handler, schema } = await buildRecordAction.call(this, 'update', name)
  return await handler.call(this, { schema, id, body, options })
}

export default update
