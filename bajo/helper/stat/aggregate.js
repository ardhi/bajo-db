import resolveMethod from '../../../lib/resolve-method.js'

async function aggregate (name, filter = {}, options = {}) {
  const { runHook } = this.bajo.helper
  const { collExists, buildQuery, buildMatch } = this.bajoDb.helper
  const { dataOnly = true, noHook, aggregate } = options
  options.dataOnly = false
  await collExists(name, true)
  const { handler, schema } = await resolveMethod.call(this, name, 'stat-aggregate')
  if (!noHook) {
    await runHook('bajoDb:onBeforeStatAggregate', name, aggregate, filter, options)
    await runHook(`bajoDb.${name}:onBeforeStatAggregate`, aggregate, filter, options)
  }
  const rec = await handler.call(this, { schema, filter, options })
  filter.query = await buildQuery({ filter, schema, options }) ?? {}
  filter.match = buildMatch({ input: filter.match, schema, options }) ?? {}
  if (!noHook) {
    await runHook(`bajoDb.${name}:onAfterStatAggregate`, aggregate, filter, options, rec)
    await runHook('bajoDb:onAfterStatAggregate', name, aggregate, filter, options, rec)
  }
  return dataOnly ? rec.data : rec
}

export default aggregate
