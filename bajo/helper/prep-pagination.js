async function prepPagination (filter = {}, schema) {
  const { getConfig, importPkg, error } = this.bajo.helper
  const lo = await importPkg('lodash-es')
  const _filter = lo.filter
  const { map, trim, isString, each, isPlainObject, isEmpty, keys } = lo
  const opts = getConfig('bajoDb')
  // query
  const query = filter.query ?? {}
  // limit
  let limit = parseInt(filter.limit) || opts.defaults.filter.limit
  if (limit > opts.defaults.filter.maxLimit) limit = opts.defaults.filter.maxLimit
  if (limit < 1) limit = 1
  // page
  let page = parseInt(filter.page) || 1
  if (page < 1) page = 1
  // skip/offset
  let skip = (page - 1) * limit
  if (filter.skip) {
    skip = parseInt(filter.skip) || skip
    page = undefined
  }
  if (skip < 0) skip = 0
  // sort order
  let sort
  if (schema && isEmpty(filter.sort)) {
    const columns = map(schema.properties, 'name')
    each(opts.defaults.filter.sort, s => {
      const [col] = s.split(':')
      if (columns.includes(col)) {
        filter.sort = s
        return false
      }
    })
  }
  if (!isEmpty(filter.sort)) {
    if (isPlainObject(filter.sort)) sort = filter.sort
    else if (isString(filter.sort)) {
      const item = {}
      each(filter.sort.split('+'), text => {
        let [col, dir] = map(trim(text).split(':'), i => trim(i))
        dir = parseInt(dir) || 1
        item[col] = dir / Math.abs(dir)
      })
      sort = item
    }
    if (schema) {
      const indexes = map(_filter(schema.properties, p => {
        return (!!p.index) || (!!p.primary)
      }), 'name')
      each(schema.indexes, item => {
        indexes.push(...item.fields)
      })
      const items = keys(sort)
      each(items, i => {
        if (!indexes.includes(i)) throw error('Sort on unindexed field: \'%s@%s\'', i, schema.name)
      })
    }
  }

  return { limit, page, skip, query, sort, noCount: filter.noCount }
}

export default prepPagination
