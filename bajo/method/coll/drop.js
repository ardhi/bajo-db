import resolveMethod from '../../../lib/resolve-method.js'

async function drop (name, options = {}) {
  const { runHook } = this.app.bajo
  const { handler, schema } = await resolveMethod.call(this, name, 'coll-drop', options)
  await runHook('bajoDb:beforeCollDrop' + name, schema)
  await handler.call(this, { schema, options })
  await runHook('bajoDb:afterCollDrop' + name, schema)
}

export default drop
