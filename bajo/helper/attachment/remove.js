async function remove (name, id, field, file, options = {}) {
  const { importPkg } = this.bajo.helper
  const { attachmentGetPath } = this.bajoDb.helper
  const fs = await importPkg('fs-extra')
  const path = await attachmentGetPath(name, id, field, file)
  await fs.remove(path)
}

export default remove
