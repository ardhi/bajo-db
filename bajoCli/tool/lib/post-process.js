import start from '../../../bajo/start.js'

async function postProcess ({ handler, params, path, processMsg, noConfirm }) {
  const { print, getConfig, saveAsDownload, importPkg } = this.bajo.helper
  const { prettyPrint } = this.bajoCli.helper
  const { find } = await importPkg('lodash-es')
  const [stripAnsi, confirm] = await importPkg('bajo-cli:strip-ansi', 'bajo-cli:@inquirer/confirm')
  const config = getConfig()
  const options = { fields: config.fields }
  params.push(options)

  const schema = find(this.bajoDb.schemas, { name: params[0] })
  if (!schema) print.fatal(' 0n23b', params[0])
  if (!noConfirm) {
    const answer = await confirm({ message: print.__('Are you sure to continue?') })
    if (!answer) print.fatal('Aborted!')
  }
  const spinner = print.bora(`${processMsg}...`).start()
  await start.call(this, true)
  try {
    const resp = await this.bajoDb.helper[handler](...params)
    spinner.succeed('Done!')
    const result = config.pretty ? (await prettyPrint(resp)) : JSON.stringify(resp, null, 2)
    if (config.save) {
      const file = `/${path}/${params[0]}/${result.id}.${config.pretty ? 'txt' : 'json'}`
      await saveAsDownload(file, stripAnsi(result), 'bajoDb')
    } else console.log(result)
  } catch (err) {
    spinner.fatal('Error: %s', err.message)
  }
  process.exit() // force closed
}

export default postProcess
