import buildRecordAction from '../../../lib/build-record-action.js'

async function count (name, filter, options = {}) {
  const { runHook } = this.bajo.helper
  const { collExists } = this.bajoDb.helper
  const { dataOnly = true, skipHook } = options
  await collExists(name, true)
  const { handler, schema } = await buildRecordAction.call(this, name, 'count')
  if (!skipHook) {
    await runHook('bajoDb:onBeforeRecordCount', name, filter, options)
    await runHook(`bajoDb.${name}:onBeforeRecordCount`, filter, options)
  }
  const rec = await handler.call(this, { schema, filter, options })
  if (!skipHook) {
    await runHook(`bajoDb.${name}:onAfterRecordCount`, filter, options, rec)
    await runHook('bajoDb:onAfterRecordCount', name, filter, options, rec)
  }
  return dataOnly ? rec.data : rec
}

export default count
