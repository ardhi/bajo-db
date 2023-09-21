import propType from './prop-type.js'

async function sanitizeProp (prop, item) {
  const { importPkg, getConfig, fatal } = this.bajo.helper
  const { has, get, each } = await importPkg('lodash-es')
  const opts = getConfig('bajoDb')
  const def = propType[prop.type]
  if (prop.unique) prop.required = true
  if (prop.type === 'string') {
    def.minLength = prop.minLength ?? 0
    def.maxLength = prop.maxLength ?? 255
    if (has(prop, 'length')) def.maxLength = prop.length
    if (prop.required && def.minLength === 0) def.minLength = 1
    if (def.minLength > 0) prop.required = true
  }
  each(['minLength', 'maxLength', 'precision', 'scale', 'kind'], p => {
    if (!has(def, p)) {
      delete prop[p]
      return undefined
    }
    prop[p] = get(prop, p, get(opts, `defaults.property.${prop.type}.${p}`, def[p]))
    if (def.choices && !def.choices.includes(prop[p])) {
      fatal('Unsupported %s \'%s\' for \'%s@%s\'. Allowed choices: %s',
        p, prop[p], prop.name, item.name, def.choices.join(', '))
    }
  })
}

async function sanitizeFeature (item) {
  const { importPkg, fatal } = this.bajo.helper
  const { get, isPlainObject, mergeWith, isArray } = await importPkg('lodash-es')
  for (const f in item.feature) {
    if (!item.feature[f]) continue
    const feature = get(this.bajoDb.feature, f)
    if (!feature) fatal('Unknown feature \'%s@%s\'', f, item.name)
    const builder = get(this.bajoDb.feature, `${f}.addProps`)
    if (!builder) return
    let props = await builder.call(this, item.feature[f])
    if (isPlainObject(props)) props = [props]
    if (props.length > 0) item.properties.push(...props)
    const globalRules = get(this.bajoDb.feature, `${f}.globalRules`)
    item.globalRules = item.globalRules ?? []
    if (globalRules) {
      item.globalRules = mergeWith(item.globalRules, globalRules, (oval, sval) => {
        if (isArray(oval)) return oval.concat(sval)
      })
    }
  }
}

async function sanitizeIndexes (item) {
  const { importPkg, fatal } = this.bajo.helper
  const { isString, isArray, findIndex } = await importPkg('lodash-es')
  for (const idx of item.indexes ?? []) {
    if (!(isString(idx.fields) || isArray(idx.fields))) fatal('Only accept array of field names or single string of field name \'%s@%s\'', 'indexes', item.name)
    if (idx.unique) {
      for (const f of idx.fields) {
        const i = findIndex(item.properties, { name: f })
        item.properties[i].required = true
      }
    }
  }
}

async function sanitizeSchema (items) {
  const { importPkg, freeze, log, fatal } = this.bajo.helper
  const { map, keys, findIndex, find, each, merge, pick, without } = await importPkg('lodash-es')
  const properties = without(keys(propType), 'validator')
  const schemas = []
  for (const k in items) {
    log.trace('Load schema: %s (%d)', k, keys(items[k]).length)
    for (const f in items[k]) {
      const item = items[k][f]
      const idField = {
        name: 'id',
        type: 'string',
        maxLength: 50,
        required: true,
        primary: true
      }
      const idx = findIndex(item.properties, { name: 'id' })
      if (idx > -1) merge(item.properties[idx], pick(idField, ['name', 'type', 'required', 'primary']))
      else item.properties.unshift(idField)
      item.feature = item.feature ?? {}
      await sanitizeFeature.call(this, item)
      item.disabled = item.disabled ?? []
      if (item.readonly) {
        item.disabled = ['create', 'update', 'remove']
        delete item.readonly
      }
      for (const prop of item.properties) {
        if (!prop.type) fatal('Missing property type for \'%s@%s\'', prop.name, item.name)
        if (!properties.includes(prop.type)) fatal('Unsupported property type \'%s@%s\' in \'%s\'', prop.type, prop.name, item.name)
        await sanitizeProp.call(this, prop, item)
      }
      await sanitizeIndexes.call(this, item)
      const all = []
      each(item.properties, p => {
        if (!all.includes(p.name)) all.push(p.name)
        else fatal('Field \'%s@%s\' should be used only once', p.name, item.name)
      })
      const conn = find(this.bajoDb.connections, { name: item.connection })
      if (!conn) {
        log.error('Unknown connection \'%s@%s\'', item.connection, item.name)
        continue
      }
      schemas.push(item)
    }
  }
  this.bajoDb.schemas = schemas
  freeze(this.bajoDb.schemas)
  log.debug('Loaded schemas: %s', map(this.bajoDb.schemas, 'name').join(', '))
}

export default sanitizeSchema
