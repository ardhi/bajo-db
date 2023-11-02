async function create (name, spinner) {
  const { getConfig, importModule, runHook } = this.bajo.helper
  const { getInfo } = this.bajoDb.helper
  const { driver, schema } = await getInfo(name)
  const cfg = getConfig(driver.provider, { full: true })
  const mod = await importModule(`${cfg.dir.pkg}/bajoDb/method/coll/create.js`)
  await runHook('bajoDb:beforeCollCreate' + name, schema)
  await mod.call(this, schema)
  await runHook('bajoDb:afterCollCreate' + name, schema)
}

export default create
