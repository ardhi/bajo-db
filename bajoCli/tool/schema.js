async function schema ({ path, args }) {
  const { importPkg, print, getConfig, saveAsDownload } = this.app.bajo
  const { prettyPrint } = this.bajoCli.helper
  const { get, isEmpty, map, find } = this.app.bajo.lib._
  const [stripAnsi, select] = await importPkg('bajoCli:strip-ansi', 'bajoCli:@inquirer/select')
  const config = getConfig()
  const schemas = get(this, 'bajoDb.schemas', [])
  if (isEmpty(schemas)) return print.fail('No schema found!', { exit: config.tool })
  let name = args[0]
  if (isEmpty(name)) {
    const choices = map(schemas, s => ({ value: s.name }))
    name = await select({
      message: print.write('Please choose a schema:'),
      choices
    })
  }
  let result = find(schemas, { name })
  if (!result) return print.fail('Can\'t find %s named \'%s\'', print.write('schema'), name, { exit: config.tool })
  print.info('Done!')
  result = config.pretty ? (await prettyPrint(result, false, false)) : JSON.stringify(result, null, 2)
  if (config.save) {
    const file = `/${path}/${name}.${config.pretty ? 'txt' : 'json'}`
    await saveAsDownload(file, stripAnsi(result))
  } else console.log(result)
}

export default schema
