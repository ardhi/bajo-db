import buildRecordAction from '../../../lib/build-record-action.js'

async function remove (name, id, options = {}) {
  const { runHook } = this.bajo.helper
  const { pickRecord, repoExists } = this.bajoDb.helper
  const { fields, dataOnly = true } = options
  await repoExists(name, true)
  const { handler, schema } = await buildRecordAction.call(this, name, 'remove')
  await runHook(`bajoDb.${name}:onBeforeRecordRemove`, id, options)
  const record = await handler.call(this, { schema, id, options })
  await runHook(`bajoDb.${name}:onAfterRecordRemove`, id, options, record)
  record.oldData = await pickRecord({ record: record.oldData, fields, schema })
  return dataOnly ? record.oldData : record
}

export default remove
