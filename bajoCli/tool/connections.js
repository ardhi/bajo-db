async function connection (path, args) {
  const { importPkg, print, getConfig, saveAsDownload } = this.bajo.helper
  const { prettyPrint } = this.bajoCli.helper
  const { get } = await importPkg('lodash-es')
  const stripAnsi = await importPkg('bajo-cli:strip-ansi')
  const config = getConfig()
  let result = get(this, 'bajoDb.config.connections', [])
  print.info('Done!')
  result = config.pretty ? (await prettyPrint(result)) : JSON.stringify(result, null, 2)
  if (config.save) {
    const file = `/${path}.${config.pretty ? 'txt' : 'json'}`
    await saveAsDownload(file, stripAnsi(result), 'bajoDb')
  } else console.log(result)
}

export default connection
