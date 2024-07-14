async function resolveMethod (name, method, options = {}) {
  const { getInfo } = this.bajoDb.helper
  const { fs, getConfig, importModule, error } = this.app.bajo
  const { camelCase } = this.app.bajo.lib._
  const { schema, driver, connection } = await getInfo.call(this, name)
  if (!options.force && (schema.disabled ?? []).includes(method)) throw error('Method \'%s@%s\' is disabled', camelCase(method), name)
  const cfg = getConfig(driver.plugin, { full: true })
  const [group, action] = method.split('-')
  const file = `${cfg.dir.pkg}/bajoDb/method/${group}/${action}.js`
  if (!fs.existsSync(file)) throw error('Method \'%s@%s\' is unsupported', camelCase(method), name)
  const handler = await importModule(file)
  return { handler, schema, driver, connection }
}

export default resolveMethod
