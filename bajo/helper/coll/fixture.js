import path from 'path'

async function fixture (model) {
  const { pathResolve, readConfig, importPkg } = this.bajo.helper
  const { isEmpty } = await importPkg('lodash-es')
  const { getInfo, recordCreate } = this.bajoDb.helper
  const { schema } = await getInfo(model)
  const pattern = `${path.dirname(schema.file)}/../fixture/${path.basename(schema.file, path.extname(schema.file))}.*`
  const items = await readConfig(pathResolve(pattern), { ignoreError: true })
  if (isEmpty(items)) return
  const result = { success: 0, failed: 0 }
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
