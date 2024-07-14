async function handleAttachmentUpload ({ action, name, id, options = {} } = {}) {
  const { fs, getPluginDataDir } = this.app.bajo
  const { attachmentPreCheck, attachmentCopyUploaded } = this.bajoDb.helper
  const { req, mimeType, stats, setFile, setField } = options

  name = attachmentPreCheck(name)
  if (!name) return
  if (action === 'remove') {
    const dir = `${getPluginDataDir('bajoDb')}/attachment/${name}/${id}`
    await fs.remove(dir)
    return
  }
  return attachmentCopyUploaded(name, id, { req, mimeType, stats, setFile, setField })
}

export default handleAttachmentUpload
