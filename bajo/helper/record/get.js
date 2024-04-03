import buildRecordAction from '../../../lib/build-record-action.js'

async function get (name, id, options = {}) {
  const { runHook } = this.bajo.helper
  const { pickRecord, collExists, sanitizeId } = this.bajoDb.helper
  const { get, set } = this.bajoDb.cache ?? {}
  options.dataOnly = options.dataOnly ?? true
  let { fields, dataOnly, skipHook, skipCache, ignoreHidden, ignoreFields } = options
  await collExists(name, true)
  const { handler, schema } = await buildRecordAction.call(this, name, 'get')
  id = sanitizeId(id, schema)
  options.dataOnly = false
  if (!skipHook) {
    await runHook('bajoDb:onBeforeRecordGet', name, id, options)
    await runHook(`bajoDb.${name}:onBeforeRecordGet`, id, options)
  }
  if (options.ignoreFields) ignoreFields = options.ignoreFields
  if (get && !skipCache) {
    const cachedResult = await get({ coll: name, id, options })
    if (cachedResult) {
      cachedResult.cached = true
      return dataOnly ? cachedResult.data : cachedResult
    }
  }
  const record = await handler.call(this, { schema, id, options })
  if (!skipHook) {
    await runHook(`bajoDb.${name}:onAfterRecordGet`, id, options, record)
    await runHook('bajoDb:onAfterRecordGet', name, id, options, record)
  }
  if (options.ignoreFields) ignoreFields = options.ignoreFields
  record.data = await pickRecord({ record: record.data, fields, schema, ignoreHidden, ignoreFields })
  if (set && !skipCache) await set({ coll: name, id, options, record })
  return dataOnly ? record.data : record
}

export default get
