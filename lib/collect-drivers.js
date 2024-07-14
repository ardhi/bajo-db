async function collectDrivers () {
  const { eachPlugins, readConfig, fatal, runHook } = this.app.bajo
  const { isString, find, pick, merge } = this.app.bajo.lib._
  this.drivers = []
  await runHook('bajoDb:beforeCollectDrivers')
  await eachPlugins(async function ({ file, ns }) {
    const info = await readConfig(file)
    if (!info.type) fatal('A DB driver must provide at least one database type')
    if (!info.driver) fatal('A DB driver must have a driver name')
    if (isString(info.type)) info.type = [info.type]
    if (!info.idField) info.idField = this.config.defaults.idField
    info.idField.name = 'id'
    for (const t of info.type) {
      const [type, provider] = t.split('@')
      const exists = find(this.drivers, { type, ns })
      if (exists) fatal('Database type \'%s\' already supported by driver \'%s\'', type, info.driver)
      const driver = pick(find(this.app[ns].drivers, { name: type }) ?? {}, ['dialect', 'idField', 'lowerCaseColl', 'returning'])
      const ext = {
        type,
        ns,
        provider,
        driver: info.driver,
        idField: info.idField
      }
      this.bajoDb.drivers.push(merge(ext, driver))
    }
  }, {
    glob: 'boot/driver.*'
  })
  await runHook('bajoDb:afterCollectDrivers')
}

export default collectDrivers
