import buildRecordAction from '../../../lib/build-record-action.js'

async function update (name, id, body, options = {}) {
  const { runHook, importPkg } = this.bajo.helper
  const { pickRecord, sanitizeBody, repoExists, validate } = this.bajoDb.helper
  const { get, keys } = await importPkg('lodash-es')
  const { fields, dataOnly = true, skipHook, validateConvert = true, ignoreHidden } = options
  await repoExists(name, true)
  const validateFields = keys(body)
  body = await validate(body, name, { fields: validateFields, opts: { abortEarly: false, convert: validateConvert } })
  const { handler, schema } = await buildRecordAction.call(this, name, 'update')
  if (!skipHook) {
    await runHook('bajoDb:onBeforeRecordUpdate', name, id, body, options)
    await runHook(`bajoDb.${name}:onBeforeRecordUpdate`, id, body, options)
  }
  for (const f in schema.feature) {
    if (!schema.feature[f]) continue
    const beforeUpdate = get(this.bajoDb, `feature.${f}.hook.beforeUpdate`)
    if (beforeUpdate) await beforeUpdate.call(this, { schema, body })
  }
  const newBody = await sanitizeBody({ body, schema, partial: true })
  delete newBody.id
  const result = await handler.call(this, { schema, id, body: newBody, options })
  if (!skipHook) {
    await runHook(`bajoDb.${name}:onAfterRecordUpdate`, id, newBody, options, result)
    await runHook('bajoDb:onAfterRecordUpdate', name, id, newBody, options, result)
  }
  result.oldData = await pickRecord({ record: result.oldData, fields, schema, ignoreHidden })
  result.data = await pickRecord({ record: result.data, fields, schema, ignoreHidden })
  return dataOnly ? result.data : result
}

export default update
