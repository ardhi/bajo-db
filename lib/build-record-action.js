async function buildRecordAction (name, action, options = {}) {
  const { getInfo } = this.bajoDb.helper
  const { getConfig, importModule, error, importPkg } = this.bajo.helper
  const fs = await importPkg('fs-extra')
  const { camelCase } = await importPkg('lodash-es')
  const { schema, driver, connection } = await getInfo.call(this, name)
  if (!options.force && (schema.disabled ?? []).includes(action)) throw error('Method \'%s@%s\' is disabled', camelCase('record ' + action), name)
  const cfg = getConfig(driver.provider, { full: true })
  const file = `${cfg.dir.pkg}/bajoDb/method/record/${action}.js`
  if (!fs.existsSync(file)) throw error('Method \'%s@%s\' is unsupported', camelCase('record ' + action), name)
  const handler = await importModule(file)
  return { handler, schema, driver, connection }
}

export default buildRecordAction
