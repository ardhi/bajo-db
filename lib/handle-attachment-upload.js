async function handleAttachmentUpload ({ action, name, id, options = {} } = {}) {
  const { importPkg, getPluginDataDir, pascalCase } = this.bajo.helper
  const { attachmentCopyUploaded } = this.bajoDb.helper
  const fs = await importPkg('fs-extra')
  const { req, mimeType, stats, setFile, setField } = options

  name = pascalCase(name)
  if (action === 'remove') {
    const dir = `${getPluginDataDir('bajoDb')}/attachment/${name}/${id}`
    await fs.remove(dir)
    return
  }
  return attachmentCopyUploaded(name, id, { req, mimeType, stats, setFile, setField })
}

export default handleAttachmentUpload
