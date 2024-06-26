import resolveMethod from '../../../lib/resolve-method.js'
import multiRelRows from '../../../lib/multi-rel-rows.js'

async function find (name, filter = {}, opts = {}) {
  const { runHook, isSet } = this.bajo.helper
  const { collExists, pickRecord, buildQuery, buildMatch } = this.bajoDb.helper
  const { get, set } = this.bajoDb.cache ?? {}
  const { cloneDeep } = this.bajo.helper._
  const options = cloneDeep(opts)
  options.dataOnly = options.dataOnly ?? true
  const { fields, dataOnly, noHook, noCache, hidden } = options
  options.count = options.count ?? false
  options.dataOnly = false
  await collExists(name, true)
  const { handler, schema } = await resolveMethod.call(this, name, 'record-find')
  filter.query = await buildQuery({ filter, schema, options }) ?? {}
  filter.match = buildMatch({ input: filter.match, schema, options }) ?? {}
  if (!noHook) {
    await runHook('bajoDb:onBeforeRecordFind', name, filter, options)
    await runHook(`bajoDb.${name}:onBeforeRecordFind`, filter, options)
  }
  if (get && !noCache) {
    const cachedResult = await get({ coll: name, filter, options })
    if (cachedResult) {
      cachedResult.cached = true
      return dataOnly ? cachedResult.data : cachedResult
    }
  }
  const records = await handler.call(this, { schema, filter, options })
  if (!noHook) {
    await runHook(`bajoDb.${name}:onAfterRecordFind`, filter, options, records)
    await runHook('bajoDb:onAfterRecordFind', name, filter, options, records)
  }
  for (const idx in records.data) {
    records.data[idx] = await pickRecord({ record: records.data[idx], fields, schema, hidden })
  }
  if (isSet(options.rels)) await multiRelRows.call(this, { schema, records: records.data, options })
  if (set && !noCache) await set({ coll: name, filter, options, records })
  return dataOnly ? records.data : records
}

export default find
