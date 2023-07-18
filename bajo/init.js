async function connBuilder (item, config) {
  const { importPkg, fatal, importModule } = this.bajo.helper
  const { dbTypes } = this.bajoDb.helper
  const { has } = await importPkg('lodash-es')
  const fs = await importPkg('fs-extra')
  if (!has(item, 'type')) fatal('Connection must have a valid type', { code: 'BAJODB_CONNECTION_MISSING_TYPE' })
  if (!dbTypes.includes(item.type)) fatal('Unknown db type \'%s\'', item.type, { code: 'BAJODB_UNKNOWN_DB_TYPE' })
  if (!has(item, 'name')) item.name = 'default'
  item.options = item.options || {}
  let sanitizer = `${config.dir}/lib/conn-sanitizer/${item.type}.js`
  if (!fs.existsSync(sanitizer)) sanitizer = `${config.dir}/lib/conn-sanitizer/generic.js`
  const mod = await importModule(sanitizer, { forCollector: true })
  await mod.handler.call(this, item)
}

export default async function () {
  const { buildConnections, log } = this.bajo.helper
  const conns = await buildConnections('bajoDb', connBuilder, ['name'])
  if (conns.length === 0) log.warn('No database connection found!')
}
