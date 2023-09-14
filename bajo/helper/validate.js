import joi from 'joi'
import propType from '../../lib/prop-type.js'

const excludedTypes = ['object']
const excludedNames = ['id']

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

async function buildFromDbSchema (repo, { fields = [], rule = {} } = {}) {
  const { importPkg } = this.bajo.helper
  const { getInfo } = this.bajoDb.helper
  const { schema } = await getInfo(repo)
  // if (schema.validation) return schema.validation
  const { isPlainObject, get, each, isEmpty, isString, forOwn, keys, find } = await importPkg('lodash-es')
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
    const has = { min: false, max: false }
    each(get(rule, prop.name, prop.rules) ?? [], r => {
      const types = validator[propType[prop.type].validator]
      const { key, value } = getRuleKv(r)
      if (!key || !types.includes(key)) return undefined
      if (keys(has).includes(key)) has[key] = true
      obj = obj[key](value)
    })
    if (['string', 'text'].includes(prop.type)) {
      forOwn(has, (v, k) => {
        if (v) return undefined
        obj = obj[k](prop[`${k}Length`])
      })
    }
    if (prop.required) obj = obj.required()
    return obj
  }

  for (const p of schema.properties) {
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
        item = applyFieldRules(p, joi.number().precision(p.precision))
        break
      case 'date':
      case 'datetime':
        item = applyFieldRules(p, joi.date())
        break
      case 'timestamp':
        item = applyFieldRules(p, joi.date())
        break
      case 'boolean':
        item = applyFieldRules(p, joi.boolean())
        break
    }
    if (item) obj[p.name] = item
  }
  if (isEmpty(obj)) return false
  /*
  forOwn(get(schema, 'globalRule', {}), (columns, rule) => {
    each(columns ?? [], c => {
      if (!obj[c]) return undefined
      const prop = find(schema.properties, { name: c })
      if (!prop) return undefined
      const types = validator[propType[prop.type].validator]
      const { key, value } = getRuleKv(rule)
      if (!types.includes(key)) return undefined
      obj[c] = obj[c][key](value)
    })
  })
  */
  each(get(schema, 'globalRules', []), r => {
    each(keys(obj), k => {
      const prop = find(schema.properties, { name: k })
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

async function validate (value, joiSchema, { ns = ['bajoDb'], fields, opts, rule } = {}) {
  const { error, importPkg } = this.bajo.helper
  const { isString } = await importPkg('lodash-es')
  opts = opts ?? { abortEarly: false, convert: false }
  if (isString(joiSchema)) joiSchema = await buildFromDbSchema.call(this, joiSchema, { fields, rule })
  if (!joiSchema) return
  const result = joiSchema.validate(value, opts)
  if (result.error) {
    /*
    const details = map(result.error.details ?? [], d => {
      return {
        field: d.context.key,
        error: d.message.replaceAll(`"${d.context.key}"`, '%s')
      }
    })
    */
    const { details } = result.error
    throw error('Validation Error', { details, ns, statusCode: 422 })
  }
  return result.value
}

export default validate
