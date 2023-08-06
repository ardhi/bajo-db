import buildRecordAction from '../../../lib/build-record-action.js'

async function update (name, id, body, options = {}) {
  const { isSet, runHook } = this.bajo.helper
  const { pickRecord, sanitizeBody, repoExists } = this.bajoDb.helper
  const { fields, dataOnly = true } = options
  await repoExists(name, true)
  const { handler, schema } = await buildRecordAction.call(this, name, 'update')
  const newBody = await sanitizeBody({ body, schema, partial: true })
  delete newBody.id
  if (schema.feature.updatedAt && !isSet(newBody[schema.feature.updatedAt.propName])) newBody[schema.feature.updatedAt.propName] = new Date()
  await runHook('bajoDb:beforeRecordUpdate' + name, id, newBody, options)
  const result = await handler.call(this, { schema, id, body: newBody, options })
  await runHook('bajoDb:afterRecordUpdate' + name, id, newBody, options, result)
  result.oldData = await pickRecord({ record: result.oldData, fields, schema })
  result.data = await pickRecord({ record: result.data, fields, schema })
  return dataOnly ? result.data : result
}

export default update
