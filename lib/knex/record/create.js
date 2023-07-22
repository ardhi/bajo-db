import sanitizeBody from '../../sanitizer/body.js'
import getConn from '../get-conn.js'
import pickRecord from '../../misc/pick-record.js'

async function createRecord ({ schema, body, options = {} } = {}) {
  const { generateId } = this.bajo.helper
  const { fields } = options
  const { knex, returning } = await getConn.call(this, schema)
  const newBody = await sanitizeBody.call(this, { body, schema })
  newBody.id = generateId()
  const result = await knex(schema.collName)
    .insert(newBody, ...returning)
  return await pickRecord.call(this, result[0], fields)
}

export default createRecord
