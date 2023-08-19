import buildRecordAction from '../../../lib/build-record-action.js'

async function count (name, filter, options = {}) {
  const { runHook } = this.bajo.helper
  const { repoExists } = this.bajoDb.helper
  const { dataOnly = true } = options
  await repoExists(name, true)
  const { handler, schema } = await buildRecordAction.call(this, name, 'count')
  await runHook(`bajoDb.${name}:onBeforeRecordCount`, filter, options)
  const rec = await handler.call(this, { schema, filter, options })
  await runHook(`bajoDb.${name}:onAfterRecordCount`, filter, options, rec)
  return dataOnly ? rec.data : rec
}

export default count
