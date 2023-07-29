async function buildRecordAction (model, action) {
  const { getInfo } = this.bajoDb.helper
  const { getConfig, importModule } = this.bajo.helper
  const { schema, driver, connection } = await getInfo.call(this, model)
  const opts = getConfig(driver.provider, { full: true })
  const handler = await importModule(`${opts.dir}/bajoDb/method/record/${action}.js`)
  return { handler, schema, driver, connection }
}

export default buildRecordAction
