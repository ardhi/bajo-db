async function get (name, id, options = {}) {
  const { pascalCase, importPkg, getPluginDataDir } = this.bajo.helper
  const { map, pick } = await importPkg('lodash-es')
  const [fs, fastGlob, mime] = await importPkg('fs-extra', 'fast-glob', 'bajo-web:mime')
  name = pascalCase(name)
  const dir = `${getPluginDataDir('bajoDb')}/attachment/${name}/${id}`
  const files = await fastGlob(`${dir}/**/*`)
  const { fullPath, stats, mimeType } = options
  return map(files, f => {
    const item = f.replace(dir, '')
    let [, field, file] = item.split('/')
    if (!file) {
      file = field
      field = null
    }
    const rec = {
      field,
      file
    }
    if (mimeType) rec.mimeType = mime.getType(file)
    if (fullPath) rec.fullPath = f
    if (stats) {
      const s = fs.statSync(f)
      rec.stats = pick(s, ['size', 'atime', 'ctime', 'mtime'])
    }
    return rec
  })
}

export default get
