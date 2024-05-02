import collectDrivers from '../lib/collect-drivers.js'
import collectFeature from '../lib/collect-feature.js'
import collectSchema from '../lib/collect-schema.js'
import sanitizeSchema from '../lib/sanitize-schema.js'

async function defSanitizer (item) {
  const { fatal } = this.bajo.helper
  if (!item.connection) fatal('\'%s@%s\' key is required', 'connection', item.name, { payload: item })
  const { merge } = this.bajo.helper._
  return merge({}, item)
}

async function handler ({ item, index, options }) {
  const conn = item
  const { log, importModule, print } = this.bajo.helper
  const { has, find } = this.bajo.helper._
  if (!has(conn, 'type')) {
    log.error('%s must have a valid DB type', print.__('Connection'))
    return false
  }
  const driver = find(this.bajoDb.drivers, { type: conn.type })
  if (!driver) {
    log.error('Unsupported DB type \'%s\'', conn.type)
    return false
  }
  if (!has(conn, 'name')) conn.name = 'default'
  let sanitizer = await importModule(`${driver.provider}:/bajoDb/lib/${conn.type}/conn-sanitizer.js`)
  if (!sanitizer) sanitizer = defSanitizer
  const result = await sanitizer.call(this, conn)
  result.proxy = result.proxy ?? false
  result.driver = driver.driver
  return result
}

async function init () {
  const { fs, buildCollections, log, print, eachPlugins, freeze, getConfig, join } = this.bajo.helper
  const { isEmpty, map } = this.bajo.helper._
  const cfg = getConfig('bajoDb', { full: true })
  fs.ensureDirSync(`${cfg.dir.data}/attachment`)
  await collectDrivers.call(this)
  this.bajoDb.connections = await buildCollections({ handler, dupChecks: ['name'] })
  if (this.bajoDb.connections.length === 0) log.warn('No %s found!', print.__('connection'))
  freeze(this.bajoDb.connections)
  log.debug('Loaded connections: %s', join(map(this.bajoDb.connections, 'name')))
  this.bajoDb.feature = {}
  await eachPlugins(collectFeature, { glob: 'feature/*.js' })
  log.debug('Loaded features: %s', join(Object.keys(this.bajoDb.feature)))
  this.bajoDb.schemas = []
  const result = await eachPlugins(collectSchema, { glob: 'schema/*.*' })
  if (isEmpty(result)) log.warn('No %s found!', print.__('schema'))
  else await sanitizeSchema.call(this, result)
}

export default init
