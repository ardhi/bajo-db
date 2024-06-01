import resolveMethod from '../../../lib/resolve-method.js'

async function clear (name, opts = {}) {
  const { runHook } = this.bajo.helper
  const { collExists } = this.bajoDb.helper
  await collExists(name, true)
  const { cloneDeep } = this.bajo.helper._
  const options = cloneDeep(opts)
  const { noHook } = options
  const { handler, schema } = await resolveMethod.call(this, name, 'record-clear')
  if (!noHook) {
    await runHook('bajoDb:onBeforeRecordClear', name, options)
    await runHook(`bajoDb.${name}:onBeforeRecordClear`, options)
  }
  const resp = await handler.call(this, { schema, options })
  if (!noHook) {
    await runHook(`bajoDb.${name}:onAfterRecordClear`, options, resp)
    await runHook('bajoDb:onAfterRecordClear', name, options, resp)
  }
  return resp
}

export default clear
