import path from 'path'

async function fixture (name, spinner) {
  const { getConfig, resolvePath, readConfig, importPkg } = this.bajo.helper
  const { isEmpty, isArray, forOwn } = await importPkg('lodash-es')
  const { getInfo, recordCreate, validationErrorMessage } = this.bajoDb.helper
  const { schema } = await getInfo(name)
  const result = { success: 0, failed: 0 }
  const cfg = getConfig('app', { full: true })
  const base = path.basename(schema.file, path.extname(schema.file))
  // original
  const pattern = resolvePath(`${path.dirname(schema.file)}/../fixture/${base}.*`)
  let items = await readConfig(pattern, { ignoreError: true })
  if (isEmpty(items)) items = []
  // override
  const overrides = await readConfig(`${cfg.dir.pkg}/bajoDb/fixture/override/${schema.plugin}/${base}.*`, { ignoreError: true })
  if (isArray(overrides) && !isEmpty(overrides)) items = overrides
  // extend
  const extend = await readConfig(`${cfg.dir.pkg}/bajoDb/fixture/extend/${schema.plugin}/${base}.*`, { ignoreError: true })
  if (isArray(extend) && !isEmpty(extend)) items.push(...extend)
  if (isEmpty(items)) return result
  for (const item of items) {
    try {
      forOwn(item, (v, k) => {
        if (v === null) item[k] = undefined
      })
      await recordCreate(schema.name, item, { force: true })
      result.success++
    } catch (err) {
      spinner.fail(validationErrorMessage(err))
      result.failed++
    }
  }
  return result
}

export default fixture
