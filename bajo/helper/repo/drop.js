async function drop (name) {
  const { getInfo } = this.bajoDb.helper
  const { getConfig, importModule } = this.bajo.helper
  const { driver, schema } = await getInfo(name)
  const opts = getConfig(driver.provider, { full: true })
  const mod = await importModule(`${opts.dir}/bajoDb/method/repo/drop.js`)
  await mod.call(this, schema)
}

export default drop