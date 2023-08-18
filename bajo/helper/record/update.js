import buildRecordAction from '../../../lib/build-record-action.js'

async function update (name, id, body, options = {}) {
  const { runHook, importPkg } = this.bajo.helper
  const { pickRecord, sanitizeBody, repoExists } = this.bajoDb.helper
  const { get } = await importPkg('lodash-es')
  const { fields, dataOnly = true } = options
  await repoExists(name, true)
  const { handler, schema } = await buildRecordAction.call(this, name, 'update')
  const newBody = await sanitizeBody({ body, schema, partial: true })
  delete newBody.id
  await runHook('bajoDb:beforeRecordUpdate' + name, id, newBody, options)
  for (const f in schema.feature) {
    if (!schema.feature[f]) continue
    const beforeUpdate = get(this.bajoDb, `feature.${f}.hook.beforeUpdate`)
    if (beforeUpdate) await beforeUpdate.call(this, { schema, body: newBody })
  }
  const result = await handler.call(this, { schema, id, body: newBody, options })
  await runHook('bajoDb:afterRecordUpdate' + name, id, newBody, options, result)
  result.oldData = await pickRecord({ record: result.oldData, fields, schema })
  result.data = await pickRecord({ record: result.data, fields, schema })
  return dataOnly ? result.data : result
}

export default update
