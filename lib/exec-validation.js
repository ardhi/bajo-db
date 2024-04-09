async function execValidation ({ noHook, name, body, options, partial }) {
  const { runHook, importPkg } = this.bajo.helper
  const { validate } = this.bajoDb.helper
  const { get, keys } = await importPkg('lodash-es')
  if (!noHook) {
    await runHook('bajoDb:onBeforeRecordValidation', name, body, options)
    await runHook(`bajoDb.${name}:onBeforeRecordValidation`, body, options)
  }
  const { validation = {} } = options
  if (partial) {
    validation.fields = keys(body)
  }
  try {
    body = await validate(body, name, validation)
  } catch (err) {
    if (err.code === 'DB_VALIDATION' && get(options, 'req.flash')) {
      options.req.flash('validation', err)
    }
    throw err
  }
  if (!noHook) {
    await runHook('bajoDb:onAfterRecordValidation', name, body, options)
    await runHook(`bajoDb.${name}:onAfterRecordValidation`, body, options)
  }
  return body
}

export default execValidation
