import start from '../../../bajo/start.js'
const conns = []

async function postProcess ({ handler, params, path, processMsg, noConfirmation, options = {} } = {}) {
  const { print, getConfig, saveAsDownload, importPkg } = this.bajo.helper
  const { prettyPrint } = this.bajoCli.helper
  const { getInfo } = this.bajoDb.helper
  const { find, get } = await importPkg('lodash-es')
  const [stripAnsi, confirm] = await importPkg('bajo-cli:strip-ansi', 'bajo-cli:@inquirer/confirm')
  const config = getConfig()
  if (!noConfirmation && config.confirmation === false) noConfirmation = true
  params.push({ fields: config.fields, dataOnly: !config.full })

  const schema = find(this.bajoDb.schemas, { name: params[0] })
  if (!schema) print.fatal('No schema found!', params[0])
  let cont = true
  if (!noConfirmation) {
    const answer = await confirm({ message: print.__('Are you sure to continue?'), default: false })
    if (!answer) {
      print.fail('Aborted!')
      cont = false
    }
  }
  if (!cont) return
  const spinner = print.bora(`${processMsg}...`).start()
  const { connection } = await getInfo(schema)
  if (!conns.includes(connection.name)) {
    await start.call(this, connection.name)
    conns.push(connection.name)
  }
  try {
    const resp = await this.bajoDb.helper[handler](...params)
    spinner.succeed('Done!')
    const result = config.pretty ? (await prettyPrint(resp)) : JSON.stringify(resp, null, 2)
    if (config.save) {
      const id = resp.id ?? get(resp, 'data.id') ?? get(resp, 'oldData.id')
      const base = path === 'recordFind' ? params[0] : (params[0] + '/' + id)
      const file = `/${path}/${base}.${config.pretty ? 'txt' : 'json'}`
      await saveAsDownload(file, stripAnsi(result))
    } else console.log(result)
  } catch (err) {
    spinner.fail('Error: %s', err.message)
  }
}

export default postProcess
