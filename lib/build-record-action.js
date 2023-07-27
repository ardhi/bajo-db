const cache = {}

async function buildRecordAction (action, model) {
  const { getInfo } = this.bajoDb.helper
  const { getConfig, importModule } = this.bajo.helper
  const { schema, driver, connection } = await getInfo.call(this, model)
  const opts = getConfig(driver.provider, { full: true })
  const key = `${action}:${driver.type}:${driver.driver}`
  const existsKey = key + ':exists'
  if (!cache[key]) cache[key] = await importModule(`${opts.dir}/bajoDb/method/${action}-record.js`)
  if (!cache[existsKey]) cache[existsKey] = await importModule(`${opts.dir}/bajoDb/method/coll-exists.js`)
  return { handler: cache[key], existsHandler: cache[existsKey], schema, driver, connection }
}

export default buildRecordAction
