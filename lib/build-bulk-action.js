async function buildBulkAction (name, action, options = {}) {
  const { getInfo } = this.bajoDb.helper
  const { fs, importModule, error } = this.bajo.helper
  const { camelCase } = this.bajo.helper._
  const { schema, driver, connection } = await getInfo.call(this, name)
  if (!options.force && (schema.disabled ?? []).includes(action)) throw error('Method \'%s@%s\' is disabled', camelCase('bulk ' + action), name)
  const file = `${driver.plugin}:/bajoDb/method/bulk/${action}.js`
  if (!fs.existsSync(file)) throw error('Method \'%s@%s\' is unsupported', camelCase('bulk ' + action), name)
  const handler = await importModule(file)
  return { handler, schema, driver, connection }
}

export default buildBulkAction
