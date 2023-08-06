import buildRecordAction from '../../../lib/build-record-action.js'

async function clear (name, options = {}) {
  const { runHook } = this.bajo.helper
  const { repoExists } = this.bajoDb.helper
  await repoExists(name, true)
  const { handler, schema } = await buildRecordAction.call(this, name, 'clear')
  await runHook('bajoDb:beforeRecordClear' + name, options)
  const resp = await handler.call(this, { schema, options })
  await runHook('bajoDb:afterRecordClear' + name, options, resp)
  return resp
}

export default clear
