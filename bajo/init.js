import collectSchema from '../lib/collector/schema.js'
import schemaSanitizer from '../lib/sanitizer/schema.js'

async function handler ({ item, index, options }) {
  const { importPkg, fatal, importModule, print, log } = this.bajo.helper
  const { dbTypes } = this.bajoDb.helper
  const { has, find, map } = await importPkg('lodash-es')
  const fs = await importPkg('fs-extra')
  if (!has(item, 'type')) fatal('%s must have a valid type', print.__('Connection'), { code: 'BAJODB_CONNECTION_MISSING_TYPE' })
  const type = find(dbTypes, { name: item.type })
  if (!type) fatal('Unsupported type \'%s\'', item.type, { code: 'BAJODB_UNKNOWN_DB_TYPE' })
  if (!has(item, 'name')) item.name = 'default'
  let sanitizer = `${options.dir}/lib/sanitizer/connection/${item.type}.js`
  if (!fs.existsSync(sanitizer)) sanitizer = `${options.dir}/lib/sanitizer/connection/generic.js`
  const mod = await importModule(sanitizer, { asHandler: true })
  const result = await mod.handler.call(this, { item, options })
  result.driver = type.driver
  this.bajoDb.connections = this.bajoDb.connections || []
  this.bajoDb.connections.push(result)
  log.debug('Loaded connections: %s', map(this.bajoDb.connections, 'name').join(', '))
}

async function init () {
  const { buildCollections, log, print, eachPlugins, importPkg, freeze } = this.bajo.helper
  const { isEmpty } = await importPkg('lodash-es')
  const conns = await buildCollections({ handler, dupChecks: ['name'] })
  freeze(this.bajoDb.connections)
  if (conns.length === 0) log.warn('No %s found!', print.__('connection'))
  this.bajoDb.schemas = []
  const result = await eachPlugins(collectSchema, { glob: 'schema/*.*' })
  if (isEmpty(result)) log.warn('No %s found!', print.__('schema'))
  else await schemaSanitizer.call(this, result)
}

export default init
