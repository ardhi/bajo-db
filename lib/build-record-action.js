async function buildRecordAction (name, action, options = {}) {
  const { getInfo } = this.bajoDb.helper
  const { getConfig, importModule, error, importPkg } = this.bajo.helper
  const { camelCase } = await importPkg('lodash-es')
  const { schema, driver, connection } = await getInfo.call(this, name)
  if (!options.force && (schema.disabled ?? []).includes(action)) throw error('Method \'%s@%s\' is disabled', camelCase('record ' + action), name)
  const cfg = getConfig(driver.provider, { full: true })
  const handler = await importModule(`${cfg.dir.pkg}/bajoDb/method/record/${action}.js`)
  return { handler, schema, driver, connection }
}

export default buildRecordAction
