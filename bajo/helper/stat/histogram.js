import resolveMethod from '../../../lib/resolve-method.js'

const types = ['daily', 'monthly', 'yearly']

async function histogram (name, filter = {}, options = {}) {
  const { runHook, error } = this.bajo.helper
  const { collExists } = this.bajoDb.helper
  const { dataOnly = true, noHook, type } = options
  options.dataOnly = false
  if (!types.includes(type)) throw error('Histogram type must be one of these: %s', types.join(', '))
  await collExists(name, true)
  const { handler, schema } = await resolveMethod.call(this, name, 'stat-histogram')
  if (!noHook) {
    await runHook('bajoDb:onBeforeStatHistogram', name, type, filter, options)
    await runHook(`bajoDb.${name}:onBeforeStatHistogram`, type, filter, options)
  }
  const rec = await handler.call(this, { schema, type, filter, options })
  if (!noHook) {
    await runHook(`bajoDb.${name}:onAfterStatHistogram`, type, filter, options, rec)
    await runHook('bajoDb:onAfterStatHistogram', name, type, filter, options, rec)
  }
  return dataOnly ? rec.data : rec
}

export default histogram
