import path from 'path'

async function sqlite3 ({ item }) {
  const { fatal, getConfig, importPkg, pathResolve } = this.bajo.helper
  const { isEmpty, omit } = await importPkg('lodash-es')
  const fs = await importPkg('fs-extra')
  const config = getConfig()
  if (!item.filename) fatal('\'%s\' key is required', 'filename', { code: 'BAJODB_SQLITE3_NO_FILENAME', payload: item })
  if (item.filename === ':memory:') {
    item.memory = true
  } else if (!path.isAbsolute(item.filename)) {
    let file = pathResolve(`${config.dir.data}/db/${item.filename}`)
    const ext = path.extname(file)
    if (isEmpty(ext)) file += '.sqlite3'
    fs.ensureDirSync(path.dirname(file))
    item.filename = file
  }
  return {
    name: item.name,
    client: item.type,
    connection: omit(item, ['name', 'client', 'type']),
    memory: !!item.memory,
    useNullAsDefault: true
  }
}

export default sqlite3
