async function collectDrivers () {
  const { eachPlugins, readJson, importPkg, fatal, runHook } = this.bajo.helper
  const { each, isString, find, pick, merge } = await importPkg('lodash-es')
  this.bajoDb.drivers = []
  await runHook('bajoDb:beforeCollectDrivers')
  await eachPlugins(async function ({ file, plugin }) {
    const info = await readJson(file)
    if (!info.type) fatal('A DB driver must provide at least one database type')
    if (!info.driver) fatal('A DB driver must have a driver name')
    if (isString(info.type)) info.type = [info.type]
    each(info.type, t => {
      const exists = find(this.bajoDb.drivers, { type: t })
      if (exists) fatal('Database type \'%s\' already supported by driver \'%s\'', t, info.driver)
      const driver = pick(find(this[plugin].helper.drivers, { name: t }) ?? {}, ['dialect', 'forceDefaultId', 'lowerCaseColl', 'returning'])
      const ext = {
        type: t,
        provider: plugin,
        driver: info.driver
      }
      this.bajoDb.drivers.push(merge(driver, ext))
    })
    info.provider = plugin
  }, {
    glob: 'boot/driver.json'
  })
  await runHook('bajoDb:afterCollectDrivers')
}

export default collectDrivers
