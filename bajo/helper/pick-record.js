function transform ({ record, schema } = {}) {
  if (record._id) {
    record.id = record._id
    delete record._id
  }
  const result = {}
  for (const p of schema.properties) {
    result[p.name] = record[p.name] || null
  }
  return result
}

async function pickRecord ({ record, fields, schema = {} } = {}) {
  const { importPkg } = this.bajo.helper
  const { isArray, pick, clone, isEmpty } = await importPkg('lodash-es')
  if (isEmpty(record)) return record
  if (!isArray(fields)) return transform({ record, schema })
  const fl = clone(fields)
  if (!fl.includes('id')) fl.unshift('id')
  return pick(transform({ record, schema }), fl)
}

export default pickRecord
