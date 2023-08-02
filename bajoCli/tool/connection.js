async function connection (path, args) {
  const { importPkg, print, getConfig, saveAsDownload } = this.bajo.helper
  const { prettyPrint } = this.bajoCli.helper
  const { get, isEmpty, map, find } = await importPkg('lodash-es')
  const [stripAnsi, select] = await importPkg('bajo-cli:strip-ansi', 'bajo-cli:@inquirer/select')
  const config = getConfig()
  const connections = get(this, 'bajoDb.config.connections', [])
  if (isEmpty(connections)) print.fatal('No connection found!')
  let name = args[0]
  if (isEmpty(name)) {
    const choices = map(connections, s => ({ value: s.name }))
    name = await select({
      message: print.__('Please choose a connection:'),
      choices
    })
  }
  let result = find(connections, { name })
  if (!result) print.fatal('Can\'t find %s named \'%s\'', print.__('connection'), name)

  print.info('Done!')
  result = config.pretty ? (await prettyPrint(result, false, false)) : JSON.stringify(result, null, 2)
  if (config.save) {
    const file = `/${path}.${config.pretty ? 'txt' : 'json'}`
    await saveAsDownload(file, stripAnsi(result), 'bajoDb')
  } else console.log(result)
}

export default connection