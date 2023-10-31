async function remove (name, id, field, file, options = {}) {
  const { importPkg } = this.bajo.helper
  const { attachmentGetPath } = this.bajoDb.helper
  const fs = await importPkg('fs-extra')
  const path = await attachmentGetPath(name, id, field, file)
  const { req } = options
  await fs.remove(path)
  if (req && req.flash) req.flash('dbsuccess', { message: req.i18n.t('File successfully removed') })
}

export default remove
