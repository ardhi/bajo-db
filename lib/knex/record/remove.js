import getConn from '../get-conn.js'
import getRecord from './get.js'
import pickRecord from '../../misc/pick-record.js'

async function removeRecord ({ schema, id, options = {} } = {}) {
  const { knex, returning } = await getConn.call(this, schema)
  const { thrownNotFound = true, fields } = options
  let rec = await getRecord.call(this, { schema, id, options: { thrownNotFound } })
  rec = await pickRecord.call(this, rec, fields)
  await knex(schema.collName)
    .where('id', id)
    .del(...returning)
  return rec
}

export default removeRecord
