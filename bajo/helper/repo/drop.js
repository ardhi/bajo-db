async function drop (name) {
  const { getConfig, importModule, runHook } = this.bajo.helper
  const { getInfo } = this.bajoDb.helper
  const { driver, schema } = await getInfo(name)
  const cfg = getConfig(driver.provider, { full: true })
  const mod = await importModule(`${cfg.dir.pkg}/bajoDb/method/repo/drop.js`)
  await runHook('bajoDb:beforeRepoDrop' + name, schema)
  await mod.call(this, schema)
  await runHook('bajoDb:afterRepoDrop' + name, schema)
}

export default drop
