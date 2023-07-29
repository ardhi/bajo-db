async function exists (model, thrown) {
  const { error } = this.bajo
  const { getInfo } = this.bajoDb.helper
  const { getConfig, importModule } = this.bajo.helper
  const { driver, schema } = await getInfo(model)
  const opts = getConfig(driver.provider, { full: true })
  const mod = await importModule(`${opts.dir}/bajoDb/method/coll/exists.js`)
  const exist = await mod.call(this, schema)
  if (!exist && thrown) throw error('Collection doesn\'t exist yet. Please rebuild its model first')
  return exist
}

export default exists
