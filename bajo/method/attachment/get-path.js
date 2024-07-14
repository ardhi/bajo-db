async function getPath (name, id, field, file, options = {}) {
  const { fs, getConfig, pascalCase, error } = this.app.bajo
  const cfg = getConfig()
  const dir = `${cfg.dir.data}/plugins/bajoDb/attachment/${pascalCase(name)}/${id}`
  fs.ensureDirSync(dir)
  if (options.dirOnly) return dir
  const path = field ? `${dir}/${field}/${file}` : `${dir}/${file}`
  if (!fs.existsSync(path)) throw error('notfound')
  return path
}

export default getPath
