async function sanitizeBody ({ body = {}, schema = {}, partial }) {
  const { importPkg, error, isSet, dayjs } = this.bajo.helper
  const { has, cloneDeep, get, each } = await importPkg('lodash-es')
  const result = {}
  for (const p of schema.properties) {
    if (partial && !has(body, p.name)) continue
    result[p.name] = cloneDeep(body[p.name])
    if (p.required && !['id'].includes(p.name) && (!has(result, p.name) || !isSet(result[p.name]))) {
      throw error('Field \'%s@%s\' is required', p.name, schema.name, { code: 'BAJODB_FIELD_REQUIRED' })
    }
    if (['float', 'double'].includes(p.type)) result[p.name] = parseFloat(body[p.name]) || null
    if (['integer', 'smallint'].includes(p.type)) result[p.name] = parseInt(body[p.name]) || null
    each(['datetime', 'date|YYYY-MM-DD', 'time|HH:mm:ss'], t => {
      const [type, format] = t.split('|')
      if (p.type === type) {
        const dt = dayjs(body[p.name], format)
        if (!dt.isValid()) throw error('Can\'t parse \'%s\' as %s value', body[p.name], type)
        result[p.name] = dt.toDate()
      }
    })
    if (!isSet(result[p.name]) && p.default) {
      result[p.name] = p.default
      if (p.default.startsWith('helper:')) {
        const helper = p.default.split(':')[1]
        const method = get(this, helper)
        if (method) result[p.name] = await this[method]()
      } else {
        if (['float', 'double'].includes(p.type)) result[p.name] = parseFloat(result[p.name]) || null
        if (['integer', 'smallint'].includes(p.type)) result[p.name] = parseInt(result[p.name]) || null
      }
    }
  }
  return result
}

export default sanitizeBody
