import buildRecordAction from '../../../lib/build-record-action.js'

async function update (name, id, body, options = {}) {
  const { isSet } = this.bajo.helper
  const { pickRecord, sanitizeBody, collExists } = this.bajoDb.helper
  const { fields, dataOnly = true } = options
  await collExists(name, true)
  const { handler, schema } = await buildRecordAction.call(this, name, 'update')
  const newBody = await sanitizeBody({ body, schema, partial: true })
  delete newBody.id
  if (schema.feature.updatedAt && !isSet(newBody[schema.feature.updatedAt.propName])) newBody[schema.feature.updatedAt.propName] = new Date()
  const result = await handler.call(this, { schema, id, body: newBody, options })
  result.oldData = await pickRecord({ record: result.oldData, fields, schema })
  result.data = await pickRecord({ record: result.data, fields, schema })
  return dataOnly ? result.data : result
}

export default update
