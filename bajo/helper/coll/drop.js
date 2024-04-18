async function drop (name, spinner) {
  const { getConfig, importModule, runHook } = this.bajo.helper
  const { getInfo } = this.bajoDb.helper
  const { driver, schema } = getInfo(name)
  const cfg = getConfig(driver.provider, { full: true })
  const mod = await importModule(`${cfg.dir.pkg}/bajoDb/method/coll/drop.js`)
  await runHook('bajoDb:beforeCollDrop' + name, schema)
  await mod.call(this, schema)
  await runHook('bajoDb:afterCollDrop' + name, schema)
}

export default drop
