import path from 'path'

async function fixture (name) {
  const { getConfig, pathResolve, readConfig, importPkg } = this.bajo.helper
  const { isEmpty, isArray } = await importPkg('lodash-es')
  const { getInfo, recordCreate } = this.bajoDb.helper
  const { schema } = await getInfo(name)
  const result = { success: 0, failed: 0 }
  const cfg = getConfig('app', { full: true })
  // original
  const pattern = `${path.dirname(schema.file)}/../fixture/${path.basename(schema.file, path.extname(schema.file))}.*`
  let items = await readConfig(pathResolve(pattern), { ignoreError: true })
  if (isEmpty(items)) items = []
  // override
  const overrides = await readConfig(`${cfg.dir}/bajoDb/fixture/override/${schema.name}.*`, { ignoreError: true })
  if (isArray(overrides) && !isEmpty(overrides)) items = overrides
  // extend
  const extend = await readConfig(`${cfg.dir}/bajoDb/fixture/extend/${schema.name}.*`, { ignoreError: true })
  if (isArray(extend) && !isEmpty(extend)) items.push(...extend)
  if (isEmpty(items)) return result
  for (const item of items) {
    try {
      await recordCreate(schema.name, item)
      result.success++
    } catch (err) {
      result.failed++
    }
  }
  return result
}

export default fixture
