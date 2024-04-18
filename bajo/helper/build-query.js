import nql from '@tryghost/nql'

async function buildQuery ({ filter, schema, options = {} } = {}) {
  const { error } = this.bajo.helper
  const { trim, isString, isPlainObject } = this.bajo.helper._
  let query = {}
  if (isString(filter.query)) {
    if (trim(filter.query).startsWith('{')) query = JSON.parse(filter.query)
    else query = nql(filter.query).parse()
  } else if (isPlainObject(filter.query)) query = filter.query
  if (!filter.bbox) return query
  if (!this.bajoSpatial) throw error('In order to use any spatial query, you need to setup \'bajo-spatial\' first')
  return await this.bajoSpatial.helper.buildBboxQuery({ bbox: filter.bbox, query, schema, options })
}

export default buildQuery
