import propType from './prop-type.js'

async function sanitizeProp (prop, item) {
  const { importPkg, getConfig, fatal } = this.bajo.helper
  const { has, get, each } = await importPkg('lodash-es')
  const opts = getConfig('bajoDb')
  const def = propType[prop.type]
  each(['length', 'precision', 'scale', 'kind'], p => {
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

async function sanitizeFeat (item) {
  const { importPkg, fatal } = this.bajo.helper
  const { forOwn } = await importPkg('lodash-es')
  const ts = ['createdAt', 'updatedAt']
  forOwn(item.feature, (v, k) => {
    if (ts.includes(k)) {
      if (v === true) {
        v = { propName: k }
        item.feature[k] = v
      }
      item.properties.push({
        name: v.propName || k,
        type: 'datetime',
        index: true
      })
    } else fatal('Unsupported feature \'%s@%s\'', k, item.name)
  })
}

async function sanitizeSchema (items) {
  const { importPkg, freeze, log, fatal } = this.bajo.helper
  const { map, keys, findIndex, find, each } = await importPkg('lodash-es')
  const properties = keys(propType)
  const schemas = []
  for (const k in items) {
    log.trace('Load schema: %s (%d)', k, keys(items[k]).length)
    for (const f in items[k]) {
      const item = items[k][f]
      const idx = findIndex(item.properties, { name: 'id' })
      if (idx > -1) fatal('Field \'id@%s\' is a reserved field and should not be added manually', item.name)
      item.properties.unshift({
        name: 'id',
        type: 'string',
        length: 50,
        required: true,
        primary: true
      })
      if (item.feature) await sanitizeFeat.call(this, item)
      for (const prop of item.properties) {
        if (!prop.type) fatal('Missing property type for \'%s@%s\'', prop.name, item.name)
        if (!properties.includes(prop.type)) fatal('Unsupported property type \'%s@%s\' in \'%s\'', prop.type, prop.name, item.name)
        await sanitizeProp.call(this, prop, item)
      }
      const all = []
      each(item.properties, p => {
        if (!all.includes(p.name)) all.push(p.name)
        else fatal('Field \'%s@%s\' should be used only once', p.name, item.name)
      })
      const conn = find(this.bajoDb.connections, { name: item.connection })
      if (!conn) fatal('Unknown connection \'%s@%s\'', item.connection, item.name)
      schemas.push(item)
    }
  }
  this.bajoDb.schemas = schemas
  freeze(this.bajoDb.schemas)
  log.debug('Loaded schemas: %s', map(this.bajoDb.schemas, 'name').join(', '))
}

export default sanitizeSchema
