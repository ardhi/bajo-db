import net from 'net'

async function start (noRebuild) {
  const { getConfig, importPkg, importModule, log } = this.bajo.helper
  const { find, filter } = await importPkg('lodash-es')
  // this.bajoDb.instances = []
  for (const c of (this.bajoDb.connections || [])) {
    const driver = find(this.bajoDb.drivers, { driver: c.driver, type: c.type })
    const opts = getConfig(driver.provider, { full: true })
    const schemas = filter(this.bajoDb.schemas, { connection: c.name })
    const mod = await importModule(`${opts.dir}/bajoDb/instancing.js`)
    await mod.call(this, { connection: c, noRebuild, schemas })
    log.trace('Driver \'%s@%s\' instantiated', c.driver, c.name)
    /*
    const instance = await mod.call(this, { connection: c, noRebuild, schemas })
    merge(instance, pick(c, ['name', 'driver', 'type', 'memory']))
    this.bajoDb.instances.push(instance)
    */
  }

  this.bajoDb.instance = net.createServer()
  this.bajoDb.instance.listen()
}

export default start
