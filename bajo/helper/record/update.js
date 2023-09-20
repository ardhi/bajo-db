import buildRecordAction from '../../../lib/build-record-action.js'

async function update (name, id, body, options = {}) {
  const { runHook, importPkg } = this.bajo.helper
  const { pickRecord, sanitizeBody, repoExists, validate } = this.bajoDb.helper
  const { get, keys } = await importPkg('lodash-es')
  const { fields, dataOnly = true, skipHook, ignoreHidden, skipValidation } = options
  await repoExists(name, true)
  if (!skipValidation) {
    if (!skipHook) {
      await runHook('bajoDb:onBeforeRecordValidation', name, body, options)
      await runHook(`bajoDb.${name}:onBeforeRecordValidation`, body, options)
    }
    const { validation = {} } = options
    const opts = { abortEarly: false, allowUnknown: true, convert: validation.convert ?? true, rule: validation.rule }
    try {
      body = await validate(body, name, { ns: validation.ns, fields: keys(body), opts })
    } catch (err) {
      if (err.code === 'DB_VALIDATION' && get(options, 'req.flash')) {
        options.req.flash('validation', err)
      }
      throw err
    }
    if (!skipHook) {
      await runHook('bajoDb:onAfterRecordValidation', name, body, options)
      await runHook(`bajoDb.${name}:onAfterRecordValidation`, body, options)
    }
  }
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
