import genericPropSanitizer from './generic-prop-sanitizer.js'

async function sanitizeFeature (item) {
  const { fatal } = this.bajo.helper
  const { get, isPlainObject, mergeWith, isArray } = this.bajo.helper._
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
    // if (prop.type !== 'text') fatal('Fulltext index only available for field type \'text\' in \'%s@%s\'', f, item.name)
  }
}

async function sanitizeSchema (items) {
  const { freeze, log, fatal, importModule, defaultsDeep, join, breakNsPath } = this.bajo.helper
  const { propType } = this.bajoDb.helper
  const { map, keys, findIndex, find, each, isString, get, isPlainObject } = this.bajo.helper._
  const properties = keys(propType)
  const schemas = []
  for (const k in items) {
    log.trace('Load schema: %s (%d)', k, keys(items[k]).length)
    for (const f in items[k]) {
      const item = items[k][f]
      const conn = find(this.bajoDb.connections, { name: item.connection })
      if (!conn) fatal('Unknown connection \'%s@%s\'', item.connection, item.name)
      item.fullText = item.fullText ?? { fields: [] }
      item.indexes = item.indexes ?? []
      const [plugin, type] = breakNsPath(conn.type)
      const driver = find(this.bajoDb.drivers, { type, plugin, driver: conn.driver })
      if (driver.lowerCaseColl) item.collName = item.collName.toLowerCase()
      let file = `${plugin}:/bajoDb/lib/${type}/prop-sanitizer.js`
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
      const idx = findIndex(item.properties, { name: 'id' })
      if (idx === -1) item.properties.unshift(driver.idField)
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
            const feat = find(item.feature, opts)
            if (!feat) item.feature.push(opts)
            const input = await feature.call(this, opts)
            if (input.properties && input.properties.length > 0) {
              prop = input.properties[0]
              success = true
            }
          }
          if (!success) fatal('Unsupported property type \'%s@%s\' in \'%s\'', prop.type, prop.name, item.name)
        }
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
          prop.index.type = 'default'
        }
        item.properties[idx] = prop
      }
      await sanitizeIndexes.call(this, item)
      await sanitizeFullText.call(this, item)
      const all = []
      each(item.properties, p => {
        if (!all.includes(p.name)) all.push(p.name)
        else fatal('Field \'%s@%s\' should be used only once', p.name, item.name)
      })
      file = `${plugin}:/bajoDb/lib/${type}/schema-sanitizer.js`
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
      if (prop.rel) {
        for (const key in prop.rel) {
          let def = prop.rel[key]
          if (isString(def)) {
            const [rschema, rfield] = def.split(':')
            def = { schema: rschema, propName: rfield }
          }
          def.type = def.type ?? 'one-to-one'
          const rel = find(schemas, { name: def.schema })
          if (!rel) {
            fatal('No schema found for relationship \'%s@%s:%s\'', `${def.schema}:${def.propName}`, schema.name, prop.name)
          }
          const rprop = find(rel.properties, { name: def.propName })
          if (!rprop) fatal('No property found for relationship \'%s@%s:%s\'', `${def.schema}:${def.propName}`, schema.name, prop.name)
          def.fields = def.fields ?? []
          if (['*', 'all'].includes(def.fields)) {
            const relschema = find(schemas, { name: def.schema })
            def.fields = relschema.properties.map(p => p.name)
          }
          if (def.fields.length > 0 && !def.fields.includes('id')) def.fields.push('id')
          for (const f of def.fields) {
            const p = find(rel.properties, { name: f })
            if (!p) fatal('Unknown property for field \'%s\' in relationship \'%s@%s:%s\'', p, `${def.schema}:${def.propName}`, schema.name, prop.name)
          }
          prop.type = rprop.type
          if (rprop.type === 'string') prop.maxLength = rprop.maxLength
          else {
            delete prop.maxLength
            delete prop.minLength
          }
          prop.rel[key] = def
        }
        // TODO: propSanitizer must be called again
      }
      schema.properties[i2] = prop
    }
  }
  this.bajoDb.schemas = schemas
  freeze(this.bajoDb.schemas)
  log.debug('Loaded schemas: %s', join(map(this.bajoDb.schemas, 'name')))
}

export default sanitizeSchema
