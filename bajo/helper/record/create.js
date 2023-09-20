import buildRecordAction from '../../../lib/build-record-action.js'

async function create (name, body, options = {}) {
  const { generateId, runHook, importPkg } = this.bajo.helper
  const { pickRecord, sanitizeBody, repoExists, validate } = this.bajoDb.helper
  const { get } = await importPkg('lodash-es')
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
      body = await validate(body, name, { ns: validation.ns, opts })
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
  const { handler, schema } = await buildRecordAction.call(this, name, 'create', options)
  if (!skipHook) {
    await runHook('bajoDb:onBeforeRecordCreate', name, body, options)
    await runHook(`bajoDb.${name}:onBeforeRecordCreate`, body, options)
  }
  for (const f in schema.feature) {
    if (!schema.feature[f]) continue
    const beforeCreate = get(this.bajoDb, `feature.${f}.hook.beforeCreate`)
    if (beforeCreate) await beforeCreate.call(this, { schema, body })
  }
  const newBody = await sanitizeBody({ body, schema })
  // const newBody = body
  newBody.id = newBody.id ?? generateId()
  const record = await handler.call(this, { schema, body: newBody, options })
  if (!skipHook) {
    await runHook(`bajoDb.${name}:onAfterRecordCreate`, newBody, options, record)
    await runHook('bajoDb:onAfterRecordCreate', name, newBody, options, record)
  }
  record.data = await pickRecord({ record: record.data, fields, schema, ignoreHidden })
  return dataOnly ? record.data : record
}

export default create
