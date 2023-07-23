import collectDrivers from '../lib/collect-drivers.js'
import collectSchema from '../lib/collector/schema.js'
import schemaSanitizer from '../lib/sanitizer/schema.js'

const sanitizer = {}
async function defSanitizer ({ connection }) {
  return connection
}

async function handler ({ item, index, options }) {
  const conn = item
  const { importPkg, fatal, importModule, print, getConfig } = this.bajo.helper
  const { has, find } = await importPkg('lodash-es')
  const fs = await importPkg('fs-extra')
  if (!has(conn, 'type')) fatal('%s must have a valid DB type', print.__('Connection'), { code: 'BAJODB_CONNECTION_MISSING_TYPE' })
  const type = find(this.bajoDb.drivers, { type: conn.type })
  if (!type) fatal('Unsupported DB type \'%s\'', conn.type, { code: 'BAJODB_UNKNOWN_DB_TYPE' })
  if (!has(conn, 'name')) conn.name = 'default'
  const opts = getConfig(type.provider, { full: true })
  if (!sanitizer[type.provider]) {
    const file = `${opts.dir}/bajoDb/sanitizer.js`
    if (fs.existsSync(file)) sanitizer[type.provider] = await importModule(file)
    else sanitizer[type.provider] = defSanitizer
  }
  const result = await sanitizer[type.provider].call(this, { connection: conn, options })
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
  this.bajoDb.schemas = []
  const result = await eachPlugins(collectSchema, { glob: 'schema/*.*' })
  if (isEmpty(result)) log.warn('No %s found!', print.__('schema'))
  else await schemaSanitizer.call(this, result)
}

export default init
