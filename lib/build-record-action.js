import getInfo from './get-info.js'
const cache = {}

async function buildRecordAction (action, model) {
  const { getConfig, importModule } = this.bajo.helper
  const { schema, driver, conn } = await getInfo.call(this, model)
  const opts = getConfig(driver.provider, { full: true })
  const key = `${action}:${driver.type}:${driver.driver}`
  if (!cache[key]) cache[key] = await importModule(`${opts.dir}/bajoDb/method/${action}-record.js`)
  return { handler: cache[key], schema, driver, conn }
}

export default buildRecordAction
