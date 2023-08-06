async function create (name) {
  const { getConfig, importModule, runHook } = this.bajo.helper
  const { getInfo } = this.bajoDb.helper
  const { driver, schema } = await getInfo(name)
  const opts = getConfig(driver.provider, { full: true })
  const mod = await importModule(`${opts.dir}/bajoDb/method/repo/create.js`)
  await runHook('bajoDb:beforeRepoCreate' + name, schema)
  await mod.call(this, schema)
  await runHook('bajoDb:afterRepoCreate' + name, schema)
}

export default create
