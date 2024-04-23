import resolveMethod from '../../../lib/resolve-method.js'

async function aggregate (name, filter = {}, options = {}) {
  const { runHook } = this.bajo.helper
  const { collExists } = this.bajoDb.helper
  const { dataOnly = true, noHook, type } = options
  options.dataOnly = false
  await collExists(name, true)
  const { handler, schema } = await resolveMethod.call(this, name, 'stat-aggregate')
  if (!noHook) {
    await runHook('bajoDb:onBeforeStatAggregate', name, type, filter, options)
    await runHook(`bajoDb.${name}:onBeforeStatAggregate`, type, filter, options)
  }
  const rec = await handler.call(this, { schema, filter, options })
  if (!noHook) {
    await runHook(`bajoDb.${name}:onAfterStatAggregate`, type, filter, options, rec)
    await runHook('bajoDb:onAfterStatAggregate', name, type, filter, options, rec)
  }
  return dataOnly ? rec.data : rec
}

export default aggregate
