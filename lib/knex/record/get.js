import getConn from '../get-conn.js'
import pickRecord from '../../misc/pick-record.js'

async function getRecord ({ schema, id, options = {} } = {}) {
  const { error } = this.bajo.helper
  const { knex } = await getConn.call(this, schema)
  const { thrownNotFound = true, fields } = options
  const result = await knex(schema.collName)
    .where('id', id)
  if (result.length === 0 && thrownNotFound) throw error('Record \'%s@%s\' not found!', id, schema.name)
  return await pickRecord.call(this, result[0], fields)
}

export default getRecord
