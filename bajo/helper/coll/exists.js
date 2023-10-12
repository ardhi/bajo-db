async function exists (name, thrown) {
  const { error, runHook } = this.bajo.helper
  const { getInfo } = this.bajoDb.helper
  const { getConfig, importModule } = this.bajo.helper
  const { driver, schema } = await getInfo(name)
  const cfg = getConfig(driver.provider, { full: true })
  const mod = await importModule(`${cfg.dir.pkg}/bajoDb/method/coll/exists.js`)
  await runHook('bajoDb:beforeCollExists' + name, schema)
  const exist = await mod.call(this, schema)
  await runHook('bajoDb:afterCollExists' + name, schema, exist)
  if (!exist && thrown) throw error('Collection doesn\'t exist yet. Please do collection rebuild first')
  return exist
}

export default exists
