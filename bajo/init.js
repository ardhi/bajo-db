import collectDrivers from '../lib/collect-drivers.js'
import collectFeature from '../lib/collect-feature.js'
import collectSchema from '../lib/collect-schema.js'
import sanitizeSchema from '../lib/sanitize-schema.js'

const sanitizer = {}
async function defSanitizer (connection) {
  return connection
}

async function handler ({ item, index, options }) {
  const conn = item
  const { importPkg, log, importModule, print, getConfig } = this.bajo.helper
  const { has, find } = await importPkg('lodash-es')
  const fs = await importPkg('fs-extra')
  if (!has(conn, 'type')) {
    log.error('%s must have a valid DB type', print.__('Connection'))
    return false
  }
  const type = find(this.bajoDb.drivers, { type: conn.type })
  if (!type) {
    log.error('Unsupported DB type \'%s\'', conn.type)
    return false
  }
  if (!has(conn, 'name')) conn.name = 'default'
  const cfg = getConfig(type.provider, { full: true })
  if (!sanitizer[type.provider]) {
    const file = `${cfg.dir.pkg}/bajoDb/boot/sanitizer.js`
    if (fs.existsSync(file)) sanitizer[type.provider] = await importModule(file)
    else sanitizer[type.provider] = defSanitizer
  }
  const result = await sanitizer[type.provider].call(this, conn)
  result.driver = type.driver
  return result
}

async function init () {
  const { buildCollections, log, print, eachPlugins, importPkg, freeze } = this.bajo.helper
  const { isEmpty, map } = await importPkg('lodash-es')
  await collectDrivers.call(this)
  this.bajoDb.connections = await buildCollections({ handler, dupChecks: ['name'] })
  if (this.bajoDb.connections.length === 0) log.warn('No %s found!', print.__('connection'))
  freeze(this.bajoDb.connections)
  log.debug('Loaded connections: %s', map(this.bajoDb.connections, 'name').join(', '))
  this.bajoDb.feature = {}
  await eachPlugins(collectFeature, { glob: 'feature/*.js' })
  this.bajoDb.schemas = []
  const result = await eachPlugins(collectSchema, { glob: 'schema/*.*' })
  if (isEmpty(result)) log.warn('No %s found!', print.__('schema'))
  else await sanitizeSchema.call(this, result)
}

export default init
