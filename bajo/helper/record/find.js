import buildRecordAction from '../../../lib/build-record-action.js'

async function format (records, dataOnly, { fields, schema, ignoreHidden, ignoreFields } = {}) {
  const { pickRecord } = this.bajoDb.helper
  for (const idx in records.data) {
    records.data[idx] = await pickRecord({ record: records.data[idx], fields, schema, ignoreHidden, ignoreFields })
  }
  return dataOnly ? records.data : records
}

async function find (name, filter = {}, options = {}) {
  const { runHook } = this.bajo.helper
  const { collExists } = this.bajoDb.helper
  const { get, set } = this.bajoDb.cache ?? {}
  options.dataOnly = options.dataOnly ?? true
  let { fields, dataOnly, skipHook, skipCache, ignoreHidden, ignoreFields } = options
  await collExists(name, true)
  const { handler, schema } = await buildRecordAction.call(this, name, 'find')
  if (!skipHook) {
    await runHook('bajoDb:onBeforeRecordFind', name, filter, options)
    await runHook(`bajoDb.${name}:onBeforeRecordFind`, filter, options)
  }
  if (options.ignoreFields) ignoreFields = options.ignoreFields
  if (get && !skipCache) {
    const cachedResult = await get({ coll: name, filter, options })
    if (cachedResult) {
      cachedResult.cached = true
      return await format.call(this, cachedResult, dataOnly, { fields, schema, ignoreHidden, ignoreFields })
    }
  }
  const records = await handler.call(this, { schema, filter, options })
  if (!skipHook) {
    await runHook(`bajoDb.${name}:onAfterRecordFind`, filter, options, records)
    await runHook('bajoDb:onAfterRecordFind', name, filter, options, records)
  }
  if (options.ignoreFields) ignoreFields = options.ignoreFields
  if (set && !skipCache) await set({ coll: name, filter, options, records })
  return await format.call(this, records, dataOnly, { fields, schema, ignoreHidden, ignoreFields })
}

export default find
