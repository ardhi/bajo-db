import path from 'path'

async function copyUploaded (name, id, { req, setField, setFile, mimeType, stats } = {}) {
  const { fs } = this.bajo.helper
  const { attachmentPreCheck, attachmentCreate } = this.bajoDb.helper
  name = attachmentPreCheck(name)
  if (!name) return
  if (!this.bajoWeb) return
  const { getUploadedFiles } = this.bajoWeb.helper
  const { dir, files } = await getUploadedFiles(req.id, false, true)
  const result = []
  if (files.length === 0) return result
  for (const f of files) {
    let [field, ...parts] = path.basename(f).split('@')
    if (parts.length === 0) continue
    field = setField ?? field
    const file = setFile ?? parts.join('@')
    const opts = { source: f, field, file, mimeType, stats, req }
    const rec = await attachmentCreate(name, id, opts)
    delete rec.dir
    result.push(rec)
    if (setField || setFile) break
  }
  fs.removeSync(dir)
  return result
}

export default copyUploaded
