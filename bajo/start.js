async function start (conns, noRebuild) {
  const { getConfig, importPkg, importModule, log } = this.bajo.helper
  const { find, filter, isString, map } = await importPkg('lodash-es')
  if (conns === 'all') conns = this.bajoDb.connections
  else if (isString(conns)) conns = filter(this.bajoDb.connections, { name: conns })
  else conns = map(conns, c => find(this.bajoDb.connections, { name: c }))
  for (const c of conns) {
    const driver = find(this.bajoDb.drivers, { driver: c.driver, type: c.type })
    const opts = getConfig(driver.provider, { full: true })
    const schemas = filter(this.bajoDb.schemas, { connection: c.name })
    const mod = await importModule(`${opts.dir}/bajoDb/boot/instantiation.js`)
    await mod.call(this, { connection: c, noRebuild, schemas })
    log.trace('Driver \'%s@%s\' instantiated', c.driver, c.name)
  }
}

export default start
