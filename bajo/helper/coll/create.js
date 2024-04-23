import resolveMethod from '../../../lib/resolve-method.js'

async function create (name, options = {}) {
  const { runHook } = this.bajo.helper
  const { handler, schema } = await resolveMethod.call(this, name, 'coll-create', options)
  await runHook('bajoDb:beforeCollCreate' + name, schema)
  await handler.call(this, { schema, options })
  await runHook('bajoDb:afterCollCreate' + name, schema)
}

export default create
