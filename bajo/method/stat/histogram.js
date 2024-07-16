import resolveMethod from '../../../lib/resolve-method.js'

const types = ['daily', 'monthly', 'yearly']

async function histogram (name, filter = {}, options = {}) {
  const { runHook, join } = this.app.bajo
  const { dataOnly = true, noHook, type } = options
  options.dataOnly = false
  if (!types.includes(type)) throw this.error('Histogram type must be one of these: %s', join(types))
  await this.collExists(name, true)
  const { handler, schema, driver } = await resolveMethod.call(this, name, 'stat-histogram')
  filter.query = await this.buildQuery({ filter, schema, options }) ?? {}
  filter.match = this.buildMatch({ input: filter.match, schema, options }) ?? {}
  if (!noHook) {
    await runHook('bajoDb:onBeforeStatHistogram', name, type, filter, options)
    await runHook(`bajoDb.${name}:onBeforeStatHistogram`, type, filter, options)
  }
  const rec = await handler.call(this.app[driver.ns], { schema, type, filter, options })
  if (!noHook) {
    await runHook(`bajoDb.${name}:onAfterStatHistogram`, type, filter, options, rec)
    await runHook('bajoDb:onAfterStatHistogram', name, type, filter, options, rec)
  }
  return dataOnly ? rec.data : rec
}

export default histogram
