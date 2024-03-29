async function transform ({ record, schema, ignoreHidden } = {}) {
  const { dayjs } = this.bajo.helper
  const { sanitizeBody } = this.bajoDb.helper
  if (record._id) {
    record.id = record._id
    delete record._id
  }
  const result = {}
  for (const p of schema.properties) {
    if (p.hidden && !ignoreHidden) continue
    result[p.name] = record[p.name] ?? null
    if (record[p.name] === null) continue
    switch (p.type) {
      case 'time': result[p.name] = dayjs(record[p.name]).format('HH:mm:ss'); break
      case 'date': result[p.name] = dayjs(record[p.name]).format('YYYY-MM-DD'); break
    }
  }
  return await sanitizeBody({ body: result, schema, partial: true, ignoreNull: true })
}

async function pickRecord ({ record, fields, schema = {}, ignoreHidden } = {}) {
  const { importPkg } = this.bajo.helper
  const { isArray, pick, clone, isEmpty } = await importPkg('lodash-es')
  if (isEmpty(record)) return record
  /*
  if (!ignoreHidden) {
    const hidden = map(filter(schema.properties, { hidden: true }), 'name')
    record = omit(record, hidden)
  }
  */
  if (!isArray(fields)) return await transform.call(this, { record, schema, ignoreHidden })
  const fl = clone(fields)
  if (!fl.includes('id')) fl.unshift('id')
  return pick(await transform.call(this, { record, schema, ignoreHidden }), fl)
}

export default pickRecord
