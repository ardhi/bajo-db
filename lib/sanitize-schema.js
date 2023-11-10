import genericPropSanitizer from './generic-prop-sanitizer.js'

async function sanitizeFeature (item) {
  const { importPkg, fatal } = this.bajo.helper
  const { get, isPlainObject, mergeWith, isArray } = await importPkg('lodash-es')
  for (const f of item.feature) {
    const feature = get(this.bajoDb.feature, f.name) // source from collectFeature
    if (!feature) fatal('Unknown feature \'%s@%s\'', f.name, item.name)
    const input = await feature.call(this, f)
    let props = input.properties
    if (isPlainObject(props)) props = [props]
    if (props.length > 0) item.properties.push(...props)
    item.globalRules = item.globalRules ?? []
    if (input.globalRules) {
      item.globalRules = mergeWith(item.globalRules, input.globalRules, (oval, sval) => {
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
  const { importPkg, freeze, log, fatal, getConfig, importModule } = this.bajo.helper
  const { propType } = this.bajoDb.helper
  const { map, keys, findIndex, find, each, merge, pick, isString, get } = await importPkg('lodash-es')
  const properties = keys(propType)
  const schemas = []
  for (const k in items) {
    log.trace('Load schema: %s (%d)', k, keys(items[k]).length)
    for (const f in items[k]) {
      const item = items[k][f]
      const conn = find(this.bajoDb.connections, { name: item.connection })
      if (!conn) {
        log.error('Unknown connection \'%s@%s\'', item.connection, item.name)
        continue
      }
      const driver = find(this.bajoDb.drivers, { type: conn.type, driver: conn.driver })
      if (driver.lowerCaseColl) item.collName = item.collName.toLowerCase()
      const cfg = getConfig(driver.provider, { full: true })
      const file = `${cfg.dir.pkg}/bajoDb/lib/${conn.type}/prop-sanitizer.js`
      let propSanitizer = await importModule(file)
      if (!propSanitizer) propSanitizer = genericPropSanitizer
      for (const idx in item.properties) {
        let prop = item.properties[idx]
        if (isString(prop)) {
          let [name, type, maxLength, index, required] = prop.split(':')
          if (!type) type = 'string'
          maxLength = maxLength ?? 255
          prop = { name, type }
          if (type === 'string') prop.maxLength = parseInt(maxLength) || undefined
          if (index === 'unique') prop.unique = true
          else if (index === 'true') prop.index = true
          prop.required = required === 'true'
          item.properties[idx] = prop
        }
      }
      const idField = {
        name: 'id',
        type: 'string',
        maxLength: 50,
        required: true,
        primary: true
      }
      const idx = findIndex(item.properties, { name: 'id' })
      if (idx > -1) merge(item.properties[idx], pick(idField, ['name', 'required', 'primary']))
      else item.properties.unshift(idField)
      item.feature = item.feature ?? {}
      await sanitizeFeature.call(this, item)
      item.disabled = item.disabled ?? []
      if (item.readonly) {
        item.disabled = ['create', 'update', 'remove']
        delete item.readonly
      }
      for (const idx in item.properties) {
        let prop = item.properties[idx]
        if (!prop.type) {
          prop.type = 'string'
          prop.maxLength = 255
        }
        if (!properties.includes(prop.type)) {
          let success = false
          const feature = get(this.bajoDb.feature, prop.type)
          if (feature) {
            const opts = { fieldName: prop.name }
            const input = await feature.call(this, opts)
            if (input.properties && input.properties.length > 0) {
              prop = input.properties[0]
              success = true
            }
          }
          if (!success) fatal('Unsupported property type \'%s@%s\' in \'%s\'', prop.type, prop.name, item.name)
        }
        if (item.hidden.includes(prop.name)) prop.hidden = true
        await propSanitizer.call(this, { prop, schema: item, connection: conn, driver })
        item.properties[idx] = prop
      }
      delete item.hidden
      await sanitizeIndexes.call(this, item)
      const all = []
      each(item.properties, p => {
        if (!all.includes(p.name)) all.push(p.name)
        else fatal('Field \'%s@%s\' should be used only once', p.name, item.name)
      })
      schemas.push(item)
    }
  }
  this.bajoDb.schemas = schemas
  freeze(this.bajoDb.schemas)
  log.debug('Loaded schemas: %s', map(this.bajoDb.schemas, 'name').join(', '))
}

export default sanitizeSchema
