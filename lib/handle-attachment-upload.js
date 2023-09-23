import path from 'path'

async function handleAttachmentUpload ({ action, schema, id, options = {} } = {}) {
  const { importPkg, getPluginDataDir } = this.bajo.helper
  const [fs, fastGlob] = await importPkg('fs-extra', 'fast-glob')
  const { req } = options
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
    let dir = `${getPluginDataDir('bajoDb')}/attachment/${schema.name}/${id}/${field}`
    if (field.endsWith('[]')) dir = `${getPluginDataDir('bajoDb')}/attachment/${schema.name}/${id}/${field.replace('[]', '')}`
    await fs.ensureDir(dir)
    const file = parts.join('-')
    const dest = `${dir}/${file}`
    await fs.copy(f, dest)
    result.push({ field: field === '' ? undefined : field, dir, file })
  }
  await fs.remove(sourceDir)
  return result
}

export default handleAttachmentUpload
