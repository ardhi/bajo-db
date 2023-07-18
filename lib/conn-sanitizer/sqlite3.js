import path from 'path'

async function sqlite3 (item) {
  const { fatal, getConfig, importPkg, pathResolve } = this.bajo.helper
  const { isEmpty } = await importPkg('lodash-es')
  const fs = await importPkg('fs-extra')
  const config = getConfig()
  if (!item.options.filename) fatal('Filename is required', { code: 'BAJODB_SQLITE3_NO_FILENAME', payload: item })
  if (item.options.filename !== ':memory:' && !path.isAbsolute(item.options.filename)) {
    let file = pathResolve(`${config.dir.data}/db/${item.options.filename}`)
    const ext = path.extname(file)
    if (isEmpty(ext)) file += '.sqlite3'
    fs.ensureDirSync(path.dirname(file))
    item.options.filename = file
  }
}

export default sqlite3
