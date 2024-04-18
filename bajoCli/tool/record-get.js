import postProcess from './lib/post-process.js'

async function getRecord ({ path, args, options }) {
  const { importPkg, print, getConfig } = this.bajo.helper
  const { isEmpty, map, get } = this.bajo.helper._
  const [input, select] = await importPkg('bajoCli:@inquirer/input', 'bajoCli:@inquirer/select')
  const schemas = get(this, 'bajoDb.schemas', [])
  const config = getConfig()
  if (isEmpty(schemas)) return print.fail('No schema found!', { exit: config.tool })
  let [schema, id] = args
  if (isEmpty(schema)) {
    schema = await select({
      message: print.__('Please select a schema:'),
      choices: map(schemas, s => ({ value: s.name }))
    })
  }
  if (isEmpty(id)) {
    id = await input({
      message: print.__('Enter record ID:'),
      validate: text => isEmpty(text) ? print.__('ID is required') : true
    })
  }
  await postProcess.call(this, { noConfirmation: true, handler: 'recordGet', params: [schema, id], path, processMsg: 'Getting record', options })
}

export default getRecord
