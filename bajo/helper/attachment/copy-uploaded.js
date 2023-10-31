import path from 'path'

async function copyUploaded (name, id, { req, setField, setFile, mimeType, stats } = {}) {
  const { getPluginDataDir, importPkg } = this.bajo.helper
  const { attachmentCreate } = this.bajoDb.helper
  const [fs, fastGlob] = await importPkg('fs-extra', 'fast-glob')
  const sourceDir = `${getPluginDataDir('bajoWeb')}/upload/${req.id}`
  const files = await fastGlob(`${sourceDir}/*`)
  const result = []
  if (files.length === 0) return result
  for (const f of files) {
    let [field, ...parts] = path.basename(f).split('-')
    if (parts.length === 0) continue
    field = setField ?? field
    const file = setFile ?? parts.join('-')
    const opts = { source: f, field, file, mimeType, stats, req }
    const rec = await attachmentCreate(name, id, opts)
    delete rec.dir
    result.push(rec)
    if (setField || setFile) break
  }
  await fs.remove(sourceDir)
  return result
}

export default copyUploaded
