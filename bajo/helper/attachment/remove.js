async function remove (name, id, field, file, options = {}) {
  const { fs } = this.bajo.helper
  const { attachmentPreCheck, attachmentGetPath } = this.bajoDb.helper
  name = attachmentPreCheck(name)
  if (!name) return
  const path = await attachmentGetPath(name, id, field, file)
  const { req } = options
  await fs.remove(path)
  if (req && req.flash) req.flash('dbsuccess', { message: req.i18n.t('File successfully removed') })
}

export default remove
