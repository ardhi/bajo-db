import pickRecord from '../../misc/pick-record.js'
import getConn from '../get-conn.js'

async function findRecord ({ schema, filter = {}, options = {} } = {}) {
  const { prepPagination } = this.bajoDb.helper
  const { mingo } = await getConn.call(this, schema)
  const { noLimit, fields } = options
  const { limit, skip, query, sort } = await prepPagination(filter, schema)
  const cursor = mingo.find(this.bajoDb.memdb[schema.name], query ? query.toJSON() : {})
  if (!noLimit) cursor.limit(limit).skip(skip)
  if (sort) cursor.sort(sort)
  const results = cursor.all()
  for (const i in results) {
    results[i] = await pickRecord.call(this, results[i], fields)
  }
  return results
}

export default findRecord
