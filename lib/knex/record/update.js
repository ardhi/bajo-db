import sanitizeBody from '../../sanitizer/body.js'
import getConn from '../get-conn.js'
import getRecord from './get.js'
import pickRecord from '../../misc/pick-record.js'

async function updateRecord ({ schema, id, body, options } = {}) {
  const { knex, returning } = await getConn.call(this, schema)
  const { thrownNotFound = true, returnOldNew, fields } = options
  let old = await getRecord.call(this, { schema, id, options: { thrownNotFound } })
  old = await pickRecord.call(this, old, fields)
  const newBody = await sanitizeBody.call(this, { body, schema, partial: true })
  delete newBody.id
  let result = await knex(schema.collName)
    .where('id', id)
    .update(newBody, ...returning)
  result = await pickRecord.call(this, result[0], fields)
  if (returnOldNew) return { old, new: result }
  return result
}

export default updateRecord
