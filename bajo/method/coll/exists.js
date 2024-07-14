import resolveMethod from '../../../lib/resolve-method.js'

const cache = {}

async function exists (name, thrown, options = {}) {
  if (cache[name]) return cache[name]
  const { error, runHook } = this.app.bajo
  const { handler, schema } = await resolveMethod.call(this, name, 'coll-exists', options)
  await runHook('bajoDb:beforeCollExists' + name, schema)
  const exist = await handler.call(this, { schema, options })
  await runHook('bajoDb:afterCollExists' + name, schema, exist)
  if (!exist && thrown) throw error('Collection doesn\'t exist yet. Please do collection rebuild first')
  cache[name] = exist
  return exist
}

export default exists
