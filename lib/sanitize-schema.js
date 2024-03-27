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
  const { fatal } = this.bajo.helper
  for (const idx of item.indexes) {
    if (!(typeof idx.fields === 'string' || Array.isArray(idx.fields))) fatal('Only accept array of field names or single string of field name \'%s@%s\'', 'indexes', item.name)
  }
}

async function sanitizeFullText (item) {
  const { fatal } = this.bajo.helper
  for (const f of item.fullText.fields ?? []) {
    const prop = item.properties.find(p => p.name === f)
    if (!prop) fatal('Invalid field name \'%s@%s\'', f, item.name)
    if (prop.type !== 'text') fatal('Fulltext index only available for field type \'text\' in \'%s@%s\'', f, item.name)
  }
}

async function sanitizeSchema (items) {
  const { importPkg, freeze, log, fatal, getConfig, importModule, defaultsDeep } = this.bajo.helper
  const { propType } = this.bajoDb.helper
  const { map, keys, findIndex, find, each, merge, pick, isString, get, isPlainObject } = await importPkg('lodash-es')
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
      item.fullText = item.fullText ?? { fields: [] }
      item.indexes = item.indexes ?? []
      const driver = find(this.bajoDb.drivers, { type: conn.type, driver: conn.driver })
      if (driver.lowerCaseColl) item.collName = item.collName.toLowerCase()
      const cfg = getConfig(driver.provider, { full: true })
      let file = `${cfg.dir.pkg}/bajoDb/lib/${conn.type}/prop-sanitizer.js`
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
          if (index) prop.index = { type: index === 'true' ? 'default' : index }
          prop.required = required === 'true'
          item.properties[idx] = prop
        } else {
          if (isString(prop.index)) prop.index = { type: prop.index }
          else if (prop.index === true) prop.index = { type: 'default' }
        }
      }
      const idField = {
        name: 'id',
        type: 'string',
        maxLength: 50,
        required: true,
        index: { type: 'primary' }
      }
      const idx = findIndex(item.properties, { name: 'id' })
      if (idx > -1) merge(item.properties[idx], pick(idField, ['name', 'required', 'index']))
      else item.properties.unshift(idField)
      item.feature = item.feature ?? []
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
          const feature = get(this.bajoDb.feature, isPlainObject(prop.type) ? prop.type.name : prop.type)
          if (feature) {
            let opts = { fieldName: prop.name }
            if (isPlainObject(prop.type)) opts = defaultsDeep(opts, prop.type)
            else opts.name = prop.type
            const f = find(item.feature, opts)
            if (!f) item.feature.push(opts)
            const input = await feature.call(this, opts)
            if (input.properties && input.properties.length > 0) {
              prop = input.properties[0]
              success = true
            }
          }
          if (!success) fatal('Unsupported property type \'%s@%s\' in \'%s\'', prop.type, prop.name, item.name)
        }
        if (item.hidden.includes(prop.name)) prop.hidden = true
        if (prop.index) {
          if (prop.index === 'unique') prop.index = { type: 'unique' }
          else if (prop.index === 'fulltext') prop.index = { type: 'fulltext' }
          else if (prop.index === 'primary') prop.index = { type: 'primary' }
          else if (prop.index === true) prop.index = { type: 'default' }
        }

        await propSanitizer.call(this, { prop, schema: item, connection: conn, driver })
        if (prop.index && prop.index.type === 'primary' && prop.name !== 'id') fatal('Primary index should only be used for \'id\' field')
        if (prop.index && prop.index.type === 'fulltext') {
          item.fullText.fields.push(prop.name)
          delete prop.index
        }
        item.properties[idx] = prop
      }
      delete item.hidden
      await sanitizeIndexes.call(this, item)
      await sanitizeFullText.call(this, item)
      const all = []
      each(item.properties, p => {
        if (!all.includes(p.name)) all.push(p.name)
        else fatal('Field \'%s@%s\' should be used only once', p.name, item.name)
      })
      file = `${cfg.dir.pkg}/bajoDb/lib/${conn.type}/schema-sanitizer.js`
      const schemaSanitizer = await importModule(file)
      if (schemaSanitizer) await schemaSanitizer.call(this, { schema: item, connection: conn, driver })
      schemas.push(item)
    }
  }
  for (const i in schemas) {
    const schema = schemas[i]
    for (const i2 in schema.properties) {
      const prop = schema.properties[i2]
      if (prop.type !== 'string') delete prop.maxLength
      if (prop.ref) {
        const [rschema, rcol] = prop.ref.split(':')
        const ref = find(schemas, { name: rschema })
        if (!ref) {
          fatal('No schema found for ref \'%s@%s:%s\'', prop.ref, schema.name, prop.name)
        }
        const rprop = find(ref.properties, { name: rcol })
        if (!rprop) fatal('No property found for ref \'%s@%s\'', prop.name)
        prop.type = rprop.type
        if (rprop.type === 'string') prop.maxLength = rprop.maxLength
        else delete prop.maxLength
      }
      schema.properties[i2] = prop
    }
  }
  this.bajoDb.schemas = schemas
  freeze(this.bajoDb.schemas)
  log.debug('Loaded schemas: %s', map(this.bajoDb.schemas, 'name').join(', '))
}

export default sanitizeSchema
