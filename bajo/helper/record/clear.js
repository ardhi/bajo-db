import buildRecordAction from '../../../lib/build-record-action.js'

async function clear (name, options = {}) {
  const { collExists } = this.bajoDb.helper
  await collExists(name, true)
  const { handler, schema } = await buildRecordAction.call(this, name, 'clear')
  return await handler.call(this, { schema, options })
}

export default clear
