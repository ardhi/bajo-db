import path from 'path'

async function fixture (name, spinner) {
  const { getConfig, resolvePath, readConfig, importPkg, print } = this.bajo.helper
  const { isEmpty, isArray } = await importPkg('lodash-es')
  const { getInfo, recordCreate, recordFind, validationErrorMessage } = this.bajoDb.helper
  const { schema } = await getInfo(name)
  const result = { success: 0, failed: 0 }
  const cfg = getConfig('bajoDb', { full: true })
  const base = path.basename(schema.file, path.extname(schema.file))
  // original
  const pattern = resolvePath(`${path.dirname(schema.file)}/../fixture/${base}.*`)
  let items = await readConfig(pattern, { ignoreError: true })
  if (isEmpty(items)) items = []
  // override
  const overrides = await readConfig(`${cfg.dir.data}/fixture/override/${schema.name}.*`, { ignoreError: true })
  if (isArray(overrides) && !isEmpty(overrides)) items = overrides
  // extend
  const extend = await readConfig(`${cfg.dir.data}/fixture/extend/${schema.name}.*`, { ignoreError: true })
  if (isArray(extend) && !isEmpty(extend)) items.push(...extend)
  if (isEmpty(items)) return result
  const opts = { skipHook: true, skipCache: true }
  for (const item of items) {
    try {
      for (const k in item) {
        const v = item[k]
        if (typeof v === 'string' && v.slice(0, 2) === '?:') {
          let [, coll, field, ...query] = v.split(':')
          if (!field) field = 'id'
          const recs = await recordFind(coll, { query: query.join(':') }, opts)
          item[k] = (recs[0] ?? {})[field]
        }
        if (v === null) item[k] = undefined
      }
      await recordCreate(schema.name, item, { force: true })
      result.success++
    } catch (err) {
      if (spinner) spinner.fail(validationErrorMessage(err))
      else print.fail(validationErrorMessage(err))
      result.failed++
    }
  }
  return result
}

export default fixture
