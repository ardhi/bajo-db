const mods = [
  { method: 'recordFind' },
  { method: 'recordGet' },
  { method: 'recordCreate' },
  { method: 'recordUpdate' },
  { method: 'recordRemove' },
  '-',
  { method: 'collRebuild' },
  '-',
  { method: 'schema' },
  { method: 'connection' },
  '-',
  { method: 'quit' },
  '-'
]

async function shell ({ path, args, options }) {
  const { importPkg, print, importModule, resolvePath, currentLoc } = this.bajo.helper
  const prompts = await importPkg('bajo-cli:@inquirer/prompts')
  const { map, find, repeat, kebabCase } = await importPkg('lodash-es')
  const { select, Separator, confirm } = prompts
  const choices = map(mods, m => m === '-' ? new Separator() : ({ value: m.method }))
  const dir = currentLoc(import.meta).dir
  for (;;) {
    const method = await select({
      message: print.__('Select method:'),
      choices
    })
    if (method === 'quit') {
      const answer = await confirm({
        message: print.__('Are you sure to quit?')
      })
      if (!answer) continue
      print.info('Quitting now, have a nice day!')
      process.exit(0)
    }
    console.log(repeat('-', 80))
    print.info('Running: %s', method)
    const mod = find(mods, { method })
    const file = `${dir}/${kebabCase(mod.method)}.js`
    const instance = await importModule(resolvePath(file))
    await instance.call(this, method, [])
    console.log(repeat('-', 80))
  }
}

export default shell
