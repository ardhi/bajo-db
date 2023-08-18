import buildRecordAction from '../../../lib/build-record-action.js'

async function create (name, body, options = {}) {
  const { generateId, runHook, importPkg } = this.bajo.helper
  const { pickRecord, sanitizeBody, repoExists } = this.bajoDb.helper
  const { get } = await importPkg('lodash-es')
  const { fields, dataOnly = true } = options
  await repoExists(name, true)
  const { handler, schema } = await buildRecordAction.call(this, name, 'create', options)
  const newBody = await sanitizeBody({ body, schema })
  newBody.id = newBody.id ?? generateId()
  await runHook('bajoDb:beforeRecordCreate' + name, newBody, options)
  for (const f in schema.feature) {
    if (!schema.feature[f]) continue
    const beforeCreate = get(this.bajoDb, `feature.${f}.hook.beforeCreate`)
    if (beforeCreate) await beforeCreate.call(this, { schema, body: newBody })
  }
  const record = await handler.call(this, { schema, body: newBody, options })
  await runHook('bajoDb:afterRecordCreate' + name, newBody, options, record)
  record.data = await pickRecord({ record: record.data, fields, schema })
  return dataOnly ? record.data : record
}

export default create
