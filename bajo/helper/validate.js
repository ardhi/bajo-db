import joi from 'joi'

const excludedTypes = ['object', 'array']
const excludedNames = []

const validator = {
  string: ['alphanum', 'base64', 'case', 'creditCard', 'dataUri', 'domain', 'email', 'guid',
    'uuid', 'hex', 'hostname', 'insensitive', 'ip', 'isoDate', 'isoDuration', 'length', 'lowercase',
    'max', 'min', 'normalize', 'pattern', 'regex', 'replace', 'token', 'trim', 'truncate',
    'uppercase', 'uri'],
  number: ['great', 'less', 'max', 'min', 'multiple', 'negative', 'port', 'positive',
    'sign', 'unsafe'],
  boolean: ['falsy', 'sensitive', 'truthy'],
  date: ['greater', 'iso', 'less', 'max', 'min'],
  timestamp: ['timestamp']
}

function buildFromDbSchema (schema, { fields = [], rule = {}, extProperties = [] } = {}) {
  const { propType } = this.bajoDb.helper
  // if (schema.validation) return schema.validation
  const {
    isPlainObject, get, each, isEmpty, isString, forOwn, keys,
    find, isArray, has, cloneDeep, concat
  } = this.bajo.helper._
  const obj = {}

  function getRuleKv (rule) {
    let key
    let value
    let columns
    if (isPlainObject(rule)) {
      key = rule.rule
      value = rule.params
      columns = rule.fields
    } else if (isString(rule)) {
      [key, value, columns] = rule.split(':')
    }
    return { key, value, columns }
  }

  function applyFieldRules (prop, obj) {
    const minMax = { min: false, max: false }
    const rules = get(rule, prop.name, prop.rules ?? [])
    if (!isArray(rules)) return rules
    let isRef
    each(rules, r => {
      const types = validator[propType[prop.type].validator]
      const { key, value } = getRuleKv(r)
      if (key === 'ref') {
        isRef = true
        obj = joi.ref(value)
        return undefined
      }
      if (!key || !types.includes(key)) return undefined
      if (keys(minMax).includes(key)) minMax[key] = true
      obj = obj[key](value)
    })
    if (!isRef && ['string', 'text'].includes(prop.type)) {
      forOwn(minMax, (v, k) => {
        if (v) return undefined
        if (has(prop, `${k}Length`)) obj = obj[k](prop[`${k}Length`])
      })
    }
    if (!isRef && !['id'].includes(prop.name) && prop.required) obj = obj.required()
    return obj
  }

  const props = concat(cloneDeep(schema.properties), extProperties)

  for (const p of props) {
    if (excludedTypes.includes(p.type) || excludedNames.includes(p.name)) continue
    if (fields.length > 0 && !fields.includes(p.name)) continue
    let item
    switch (p.type) {
      case 'text':
      case 'string': {
        item = applyFieldRules(p, joi.string())
        break
      }
      case 'smallint':
      case 'integer':
        item = applyFieldRules(p, joi.number().integer())
        break
      case 'float':
      case 'double':
        if (p.precision) item = applyFieldRules(p, joi.number().precision(p.precision))
        else item = applyFieldRules(p, joi.number())
        break
      case 'time':
      case 'date':
      case 'datetime':
        item = applyFieldRules(p, joi.date())
        break
      case 'timestamp':
        item = applyFieldRules(p, joi.number().integer())
        break
      case 'boolean':
        item = applyFieldRules(p, joi.boolean())
        break
    }
    if (item) {
      if (item.$_root) obj[p.name] = item.allow(null)
      else obj[p.name] = item
    }
  }
  if (isEmpty(obj)) return false
  each(get(schema, 'globalRules', []), r => {
    each(keys(obj), k => {
      const prop = find(props, { name: k })
      if (!prop) return undefined
      const types = validator[propType[prop.type].validator]
      const { key, value, columns = [] } = getRuleKv(r)
      if (!types.includes(key)) return undefined
      if (columns.length === 0 || columns.includes(k)) obj[k] = obj[k][key](value)
    })
  })
  const result = joi.object(obj)
  if (fields.length === 0) return result
  each(['with', 'xor', 'without'], k => {
    const item = get(schema, `extRule.${k}`)
    if (item) result[k](...item)
  })
  return result
}

async function validate (value, joiSchema, { ns = ['bajoDb'], fields, extProperties, params } = {}) {
  const { error, defaultsDeep, isSet } = this.bajo.helper
  const { getInfo, sanitizeDate } = this.bajoDb.helper
  const { isString, forOwn, find } = this.bajo.helper._
  params = defaultsDeep(params, { abortEarly: false, convert: false, rule: undefined, allowUnknown: true })
  const { rule } = params
  if (isString(joiSchema)) {
    const { schema } = getInfo(joiSchema)
    forOwn(value, (v, k) => {
      if (!isSet(v)) return undefined
      const p = find(schema.properties, { name: k })
      if (!p) return undefined
      for (const t of ['date|YYYY-MM-DD', 'time|HH:mm:ss']) {
        const [type, input] = t.split('|')
        if (p.type === type) value[k] = sanitizeDate(value[k], { input, output: 'native' })
      }
    })
    joiSchema = buildFromDbSchema.call(this, schema, { fields, rule, extProperties })
  }
  if (!joiSchema) return value
  try {
    return await joiSchema.validateAsync(value, params)
  } catch (err) {
    throw error('Validation Error', { details: err.details, values: err.values, ns, statusCode: 422, code: 'DB_VALIDATION' })
  }
}

export default validate
