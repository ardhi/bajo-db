const conns = []

async function postProcess ({ handler, params, path, processMsg, noConfirmation, options = {} } = {}) {
  const { print, getConfig, saveAsDownload, importPkg, spinner, startPlugin } = this.bajo.helper
  const { prettyPrint } = this.bajoCli.helper
  const { getInfo } = this.bajoDb.helper
  const { find, get } = this.bajo.helper._
  const [stripAnsi, confirm] = await importPkg('bajoCli:strip-ansi', 'bajoCli:@inquirer/confirm')
  const config = getConfig()
  if (!noConfirmation && config.confirmation === false) noConfirmation = true
  params.push({ fields: config.fields, dataOnly: !config.full })

  const schema = find(this.bajoDb.schemas, { name: params[0] })
  if (!schema) return print.fail('No schema found!', { exit: config.tool })
  let cont = true
  if (!noConfirmation) {
    const answer = await confirm({ message: print.__('Are you sure to continue?'), default: false })
    if (!answer) {
      print.fail('Aborted!')
      cont = false
    }
  }
  if (!cont) return
  const spin = spinner().start(`${processMsg}...`)
  const { connection } = getInfo(schema)
  if (!conns.includes(connection.name)) {
    await startPlugin('bajoDb', connection.name)
    conns.push(connection.name)
  }
  try {
    const resp = await this.bajoDb.helper[handler](...params)
    spin.succeed('Done!')
    const result = config.pretty ? (await prettyPrint(resp)) : JSON.stringify(resp, null, 2)
    if (config.save) {
      const id = resp.id ?? get(resp, 'data.id') ?? get(resp, 'oldData.id')
      const base = path === 'recordFind' ? params[0] : (params[0] + '/' + id)
      const file = `/${path}/${base}.${config.pretty ? 'txt' : 'json'}`
      await saveAsDownload(file, stripAnsi(result))
    } else console.log(result)
  } catch (err) {
    if (config.log.tool) {
      spin.stop()
      console.error(err)
    } else spin.fail('Error: %s', err.message)
  }
}

export default postProcess
