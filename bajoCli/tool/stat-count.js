import postProcess from './lib/post-process.js'

async function statCount ({ path, args, options }) {
  const { importPkg, print, getConfig } = this.app.bajo
  const { isEmpty, map, get } = this.app.bajo.lib._
  const [select, input] = await importPkg('bajoCli:@inquirer/select', 'bajoCli:@inquirer/input')
  const schemas = get(this, 'bajoDb.schemas', [])
  const config = getConfig()
  if (isEmpty(schemas)) return print.fail('No schema found!', { exit: config.tool })
  let [schema, query] = args
  if (isEmpty(schema)) {
    schema = await select({
      message: print.write('Please select a schema:'),
      choices: map(schemas, s => ({ value: s.name }))
    })
  }
  if (isEmpty(query)) {
    query = await input({
      message: print.write('Please enter a query (if any):')
    })
  }
  const filter = { query }
  await postProcess.call(this, { noConfirmation: true, handler: 'statCount', params: [schema, filter], path, processMsg: 'Counting record(s)', options })
}

export default statCount
