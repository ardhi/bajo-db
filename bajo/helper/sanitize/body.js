async function sanitizeBody ({ body = {}, schema = {}, partial, strict, ignoreFields = [] }) {
  const { importPkg, isSet, dayjs } = this.bajo.helper
  const { sanitizeDate } = this.bajoDb.helper
  const { has, get, isString, isNumber } = await importPkg('lodash-es')
  const result = {}
  for (const p of schema.properties) {
    if (partial && !has(body, p.name)) continue
    if (['object', 'array'].includes(p.type)) {
      if (isString(body[p.name])) {
        try {
          result[p.name] = JSON.parse(body[p.name])
        } catch (err) {
          result[p.name] = null
        }
      } else {
        try {
          result[p.name] = JSON.parse(JSON.stringify(body[p.name]))
        } catch (err) {}
      }
    } else result[p.name] = body[p.name]
    if (isSet(body[p.name])) {
      if (p.type === 'boolean') result[p.name] = result[p.name] === null ? null : (!!result[p.name])
      if (['float', 'double'].includes(p.type)) {
        if (isNumber(body[p.name])) result[p.name] = body[p.name]
        else if (strict) {
          result[p.name] = Number(body[p.name])
        } else {
          result[p.name] = parseFloat(body[p.name]) || null
        }
      }
      if (['integer', 'smallint'].includes(p.type)) {
        if (isNumber(body[p.name])) result[p.name] = body[p.name]
        else if (strict) {
          result[p.name] = Number(body[p.name])
        } else {
          result[p.name] = parseInt(body[p.name]) || null
        }
      }
      if (p.type === 'timestamp') {
        if (!isNumber(body[p.name])) result[p.name] = -1
        else {
          const dt = dayjs.unix(body[p.name])
          result[p.name] = dt.isValid() ? dt.unix() : -1
        }
      } else {
        for (const t of ['datetime', 'date|YYYY-MM-DD', 'time|HH:mm:ss']) {
          const [type, input] = t.split('|')
          if (p.type === type) result[p.name] = sanitizeDate(body[p.name], { input })
        }
      }
    } else {
      if (p.default) {
        result[p.name] = p.default
        if (isString(p.default) && p.default.startsWith('helper:')) {
          const helper = p.default.split(':')[1]
          const method = get(this, helper)
          if (method) result[p.name] = await this[method]()
        } else {
          if (['float', 'double'].includes(p.type)) result[p.name] = parseFloat(result[p.name]) || null
          if (['integer', 'smallint'].includes(p.type)) result[p.name] = parseInt(result[p.name]) || null
        }
      }
    }
  }
  for (const f of ignoreFields) {
    if (has(body, f)) result[f] = body[f]
  }
  return result
}

export default sanitizeBody
