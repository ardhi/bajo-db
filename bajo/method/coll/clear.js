import resolveMethod from '../../../lib/resolve-method.js'

async function clear (name, options = {}) {
  const { runHook } = this.app.bajo
  await this.collExists(name, true)
  const { noHook } = options
  const { handler, schema } = await resolveMethod.call(this, name, 'coll-clear')
  if (!noHook) {
    await runHook('bajoDb:onBeforeCollClear', name, options)
    await runHook(`bajoDb.${name}:onBeforeCollClear`, options)
  }
  const resp = await handler.call(this, { schema, options })
  if (!noHook) {
    await runHook(`bajoDb.${name}:onAfterCollClear`, options, resp)
    await runHook('bajoDb:onAfterCollClear', name, options, resp)
  }
  return resp
}

export default clear
