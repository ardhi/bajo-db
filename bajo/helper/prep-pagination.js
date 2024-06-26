function buildPageSkipLimit (filter) {
  const { getConfig } = this.bajo.helper
  const cfg = getConfig('bajoDb')
  let limit = parseInt(filter.limit) || cfg.defaults.filter.limit
  if (limit > cfg.defaults.filter.maxLimit) limit = cfg.defaults.filter.maxLimit
  if (limit < 1) limit = 1
  let page = parseInt(filter.page) || 1
  if (page < 1) page = 1
  let skip = (page - 1) * limit
  if (filter.skip) {
    skip = parseInt(filter.skip) || skip
    page = undefined
  }
  if (skip < 0) skip = 0
  return { page, skip, limit }
}

function buildSort (input, schema, allowSortUnindexed) {
  const { getConfig, error } = this.bajo.helper
  const { isEmpty, map, each, isPlainObject, isString, trim, filter, keys } = this.bajo.helper._
  const cfg = getConfig('bajoDb')
  let sort
  if (schema && isEmpty(input)) {
    const columns = map(schema.properties, 'name')
    each(cfg.defaults.filter.sort, s => {
      const [col] = s.split(':')
      if (columns.includes(col)) {
        input = s
        return false
      }
    })
  }
  if (!isEmpty(input)) {
    if (isPlainObject(input)) sort = input
    else if (isString(input)) {
      const item = {}
      each(input.split('+'), text => {
        let [col, dir] = map(trim(text).split(':'), i => trim(i))
        dir = (dir ?? '').toUpperCase()
        dir = dir === 'DESC' ? -1 : parseInt(dir) || 1
        item[col] = dir / Math.abs(dir)
      })
      sort = item
    }
    if (schema) {
      const indexes = map(filter(schema.properties, p => !!p.index), 'name')
      each(schema.indexes, item => {
        indexes.push(...item.fields)
      })
      const items = keys(sort)
      each(items, i => {
        if (!indexes.includes(i) && !allowSortUnindexed) throw error('Sort on unindexed field: \'%s@%s\'', i, schema.name)
        // if (schema.fullText.fields.includes(i)) throw error('Can\'t sort on full-text index: \'%s@%s\'', i, schema.name)
      })
    }
  }
  return sort
}

async function prepPagination (filter = {}, schema, options = {}) {
  const { page, skip, limit } = buildPageSkipLimit.call(this, filter)
  let sortInput = filter.sort
  try {
    sortInput = JSON.parse(sortInput)
  } catch (err) {}
  const sort = buildSort.call(this, sortInput, schema, options.allowSortUnindexed)
  return { limit, page, skip, sort }
}

export default prepPagination
