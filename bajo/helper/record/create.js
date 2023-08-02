import buildRecordAction from '../../../lib/build-record-action.js'

async function create (name, body, options = {}) {
  const { generateId, isSet } = this.bajo.helper
  const { pickRecord, sanitizeBody, collExists } = this.bajoDb.helper
  const { fields, dataOnly = true } = options
  await collExists(name, true)
  const { handler, schema } = await buildRecordAction.call(this, name, 'create')
  const newBody = await sanitizeBody({ body, schema })
  newBody.id = newBody.id || generateId()
  const now = new Date()
  if (schema.feature.createdAt && !isSet(newBody[schema.feature.createdAt.propName])) newBody[schema.feature.createdAt.propName] = now
  if (schema.feature.updatedAt && !isSet(newBody[schema.feature.updatedAt.propName])) newBody[schema.feature.updatedAt.propName] = now
  const record = await handler.call(this, { schema, body: newBody, options })
  record.data = await pickRecord({ record: record.data, fields, schema })
  return dataOnly ? record.data : record
}

export default create