async function exists (name, thrown) {
  const { error } = this.bajo
  const { getInfo } = this.bajoDb.helper
  const { getConfig, importModule } = this.bajo.helper
  const { driver, schema } = await getInfo(name)
  const opts = getConfig(driver.provider, { full: true })
  const mod = await importModule(`${opts.dir}/bajoDb/method/coll/exists.js`)
  const exist = await mod.call(this, schema)
  if (!exist && thrown) throw error('Collection doesn\'t exist yet. Please do collection rebuild first')
  return exist
}

export default exists
