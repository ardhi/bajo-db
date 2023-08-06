async function exists (name, thrown) {
  const { error, runHook } = this.bajo.helper
  const { getInfo } = this.bajoDb.helper
  const { getConfig, importModule } = this.bajo.helper
  const { driver, schema } = await getInfo(name)
  const opts = getConfig(driver.provider, { full: true })
  const mod = await importModule(`${opts.dir}/bajoDb/method/repo/exists.js`)
  await runHook('bajoDb:beforeRepoExists' + name, schema)
  const exist = await mod.call(this, schema)
  await runHook('bajoDb:afterRepoExists' + name, schema, exist)
  if (!exist && thrown) throw error('Repository doesn\'t exist yet. Please do repository rebuild first')
  return exist
}

export default exists
