import path from 'path'

async function addFixture (name, spin) {
  const { resolvePath, readConfig, eachPlugins } = this.app.bajo
  const { isEmpty, isArray } = this.app.bajo.lib._
  const { schema, connection } = this.getInfo(name)
  if (this.app.bajoDbMemory) { // TODO: use hook maybe?
    if (connection.memory && this.app.bajoDbMemory.config.persistence.collections.includes(schema.name)) {
      this.log.warn('\'%s\' is a memory persistence collection. Adding records from fixture ignored!', schema.name)
      return
    }
  }
  if (connection.proxy) {
    this.log.warn('\'%s\' is bound to a proxied connection, skipped!', schema.name)
    return
  }
  const result = { success: 0, failed: 0 }
  const base = path.basename(schema.file, path.extname(schema.file))
  // original
  const pattern = resolvePath(`${path.dirname(schema.file)}/../fixture/${base}.*`)
  let items = await readConfig(pattern, { ignoreError: true })
  if (isEmpty(items)) items = []
  // override
  const overrides = await readConfig(`${this.app.bajo.config.dir.base}/app/bajoDb/fixture/override/${schema.name}.*`, { ignoreError: true })
  if (isArray(overrides) && !isEmpty(overrides)) items = overrides
  // extend
  await eachPlugins(async function ({ dir }) {
    const extend = await readConfig(`${dir}/bajoDb/fixture/extend/${schema.name}.*`, { ignoreError: true })
    if (isArray(extend) && !isEmpty(extend)) items.push(...extend)
  })
  if (isEmpty(items)) return result
  const opts = { noHook: true, noCache: true }
  for (const item of items) {
    try {
      for (const k in item) {
        const v = item[k]
        if (typeof v === 'string' && v.slice(0, 2) === '?:') {
          let [, coll, field, ...query] = v.split(':')
          if (!field) field = 'id'
          const recs = await this.recordFind(coll, { query: query.join(':') }, opts)
          item[k] = (recs[0] ?? {})[field]
        }
        if (v === null) item[k] = undefined
      }
      await this.recordCreate(schema.name, item, { force: true })
      result.success++
      if (spin) spin.setText('%s: %d of %d records added', schema.name, result.success, items.length)
    } catch (err) {
      err.collection = schema.name
      // if (spin) spin.fail(validationErrorMessage(err))
      this.print.fail(this.validationErrorMessage(err))
      result.failed++
    }
  }
  return result
}

export default addFixture
