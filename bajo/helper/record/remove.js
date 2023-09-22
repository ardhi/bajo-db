import buildRecordAction from '../../../lib/build-record-action.js'

async function remove (name, id, options = {}) {
  const { runHook, print, importPkg } = this.bajo.helper
  const { pickRecord, repoExists } = this.bajoDb.helper
  const { fields, dataOnly = true, skipHook, ignoreHidden } = options
  const { get } = await importPkg('lodash-es')
  await repoExists(name, true)
  const { handler, schema } = await buildRecordAction.call(this, name, 'remove')
  if (!skipHook) {
    await runHook('bajoDb:onBeforeRecordRemove', name, id, options)
    await runHook(`bajoDb.${name}:onBeforeRecordRemove`, id, options)
  }
  const record = await handler.call(this, { schema, id, options })
  if (get(options, 'req.flash')) options.req.flash('dbsuccess', { message: print.__('Record successfully removed', { ns: 'bajoDb' }), record })
  if (!skipHook) {
    await runHook(`bajoDb.${name}:onAfterRecordRemove`, id, options, record)
    await runHook('bajoDb:onAfterRecordRemove', name, id, options, record)
  }
  record.oldData = await pickRecord({ record: record.oldData, fields, schema, ignoreHidden })
  return dataOnly ? record.oldData : record
}

export default remove
