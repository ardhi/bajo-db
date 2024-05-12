async function collectDrivers () {
  const { eachPlugins, readConfig, fatal, runHook, getConfig } = this.bajo.helper
  const { isString, find, pick, merge } = this.bajo.helper._
  const cfg = getConfig('bajoDb')
  this.bajoDb.drivers = []
  await runHook('bajoDb:beforeCollectDrivers')
  await eachPlugins(async function ({ file, plugin }) {
    const info = await readConfig(file)
    if (!info.type) fatal('A DB driver must provide at least one database type')
    if (!info.driver) fatal('A DB driver must have a driver name')
    if (isString(info.type)) info.type = [info.type]
    if (!info.idField) info.idField = cfg.defaults.idField
    info.idField.name = 'id'
    for (const t of info.type) {
      const [type, provider] = t.split('@')
      const exists = find(this.bajoDb.drivers, { type, plugin })
      if (exists) fatal('Database type \'%s\' already supported by driver \'%s\'', type, info.driver)
      const driver = pick(find(this[plugin].helper.drivers, { name: type }) ?? {}, ['dialect', 'idField', 'lowerCaseColl', 'returning'])
      const ext = {
        type,
        plugin,
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
