import path from 'path'

async function handleAttachmentUpload ({ action, schema, id, options = {} } = {}) {
  const { importPkg, getPluginDataDir } = this.bajo.helper
  const { attachmentCreate } = this.bajoDb.helper
  const [fs, fastGlob] = await importPkg('fs-extra', 'fast-glob')
  const { req, mimeType, stats } = options
  const sourceDir = `${getPluginDataDir('bajoWeb')}/upload/${req.id}`
  const files = await fastGlob(`${sourceDir}/*`)
  const result = []
  if (action === 'remove') {
    const dir = `${getPluginDataDir('bajoDb')}/attachment/${schema.name}/${id}`
    await fs.remove(dir)
    return
  }
  if (files.length === 0) return result
  for (const f of files) {
    const [field, ...parts] = path.basename(f).split('-')
    if (parts.length === 0) continue
    const file = parts.join('-')
    const opts = { source: f, field, file, mimeType, stats }
    const rec = await attachmentCreate(schema.name, id, opts)
    delete rec.dir
    result.push(rec)
  }
  await fs.remove(sourceDir)
  return result
}

export default handleAttachmentUpload
