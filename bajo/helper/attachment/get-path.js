async function getPath (name, id, field, file, options = {}) {
  const { getConfig, pascalCase, importPkg, error } = this.bajo.helper
  const fs = await importPkg('fs-extra')
  const cfg = getConfig()
  const dir = `${cfg.dir.data}/plugins/bajoDb/attachment/${pascalCase(name)}/${id}`
  if (options.dirOnly) {
    if (!fs.existsSync(dir)) throw error('notfound')
    return dir
  }
  const path = field ? `${dir}/${field}/${file}` : `${dir}/${file}`
  if (!fs.existsSync(path)) throw error('notfound')
  return path
}

export default getPath
