import buildRecordAction from '../../../lib/build-record-action.js'

async function clear (name, options = {}) {
  const { runHook } = this.bajo.helper
  const { collExists } = this.bajoDb.helper
  await collExists(name, true)
  options.dataOnly = options.dataOnly ?? true
  const { skipHook } = options
  const { handler, schema } = await buildRecordAction.call(this, name, 'clear')
  if (!skipHook) {
    await runHook('bajoDb:onBeforeRecordClear', name, options)
    await runHook(`bajoDb.${name}:onBeforeRecordClear`, options)
  }
  const resp = await handler.call(this, { schema, options })
  if (!skipHook) {
    await runHook(`bajoDb.${name}:onAfterRecordClear`, options, resp)
    await runHook('bajoDb:onAfterRecordClear', name, options, resp)
  }
  return resp
}

export default clear
