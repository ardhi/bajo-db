import pickRecord from '../../misc/pick-record.js'
import getConn from '../get-conn.js'

async function findRecord ({ schema, filter = {}, options = {} } = {}) {
  const { importPkg } = this.bajo.helper
  const { prepPagination } = this.bajoDb.helper
  const { forOwn } = await importPkg('lodash-es')
  const { knex } = await getConn.call(this, schema)
  const { noLimit, fields } = options
  const { limit, skip, query, sort } = await prepPagination(filter, schema)
  let op = knex(schema.collName)
  if (query) op = query.querySQL(op)
  if (!noLimit) op.limit(limit, { skipBinding: true }).offset(skip)
  if (sort) {
    const sorts = []
    forOwn(sort, (v, k) => {
      sorts.push({ column: k, order: v < 0 ? 'desc' : 'asc' })
    })
    op.orderBy(sorts)
  }
  const results = await op
  for (const i in results) {
    results[i] = await pickRecord.call(this, results[i], fields)
  }
  return results
}

export default findRecord
