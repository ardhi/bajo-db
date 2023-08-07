async function schema (path, args) {
  const { importPkg, print, getConfig, saveAsDownload } = this.bajo.helper
  const { prettyPrint } = this.bajoCli.helper
  const { get, isEmpty, map, find } = await importPkg('lodash-es')
  const [stripAnsi, select] = await importPkg('bajo-cli:strip-ansi', 'bajo-cli:@inquirer/select')
  const config = getConfig()
  const schemas = get(this, 'bajoDb.schemas', [])
  if (isEmpty(schemas)) print.fatal('No schema found!')
  let name = args[0]
  if (isEmpty(name)) {
    const choices = map(schemas, s => ({ value: s.name }))
    name = await select({
      message: print.__('Please choose a schema:'),
      choices
    })
  }
  let result = find(schemas, { name })
  if (!result) print.fatal('Can\'t find %s named \'%s\'', print.__('schema'), name)
  print.info('Done!')
  result = config.pretty ? (await prettyPrint(result, false, false)) : JSON.stringify(result, null, 2)
  if (config.save) {
    const file = `/${path}/${name}.${config.pretty ? 'txt' : 'json'}`
    await saveAsDownload(file, stripAnsi(result))
  } else console.log(result)
}

export default schema
