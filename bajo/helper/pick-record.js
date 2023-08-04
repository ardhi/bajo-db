async function transform ({ record, schema } = {}) {
  const { sanitizeBody } = this.bajoDb.helper
  if (record._id) {
    record.id = record._id
    delete record._id
  }
  const result = {}
  for (const p of schema.properties) {
    result[p.name] = record[p.name] || null
  }
  return await sanitizeBody({ body: result, schema, partial: true })
}

async function pickRecord ({ record, fields, schema = {} } = {}) {
  const { importPkg } = this.bajo.helper
  const { isArray, pick, clone, isEmpty } = await importPkg('lodash-es')
  if (isEmpty(record)) return record
  if (!isArray(fields)) return await transform.call(this, { record, schema })
  const fl = clone(fields)
  if (!fl.includes('id')) fl.unshift('id')
  return pick(await transform.call(this, { record, schema }), fl)
}

export default pickRecord
