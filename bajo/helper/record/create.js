import buildRecordAction from '../../../lib/build-record-action.js'

async function create (name, body, options = {}) {
  const { handler, schema } = await buildRecordAction.call(this, 'create', name)
  return await handler.call(this, { schema, body, options })
}

export default create
