import postProcess from './lib/post-process.js'

async function findRecord (path, args, options) {
  const { importPkg, print } = this.bajo.helper
  const { isEmpty, map, get } = await importPkg('lodash-es')
  const [select, input] = await importPkg('bajo-cli:@inquirer/select', 'bajo-cli:@inquirer/input')
  const schemas = get(this, 'bajoDb.schemas', [])
  if (isEmpty(schemas)) print.fatal('No schema found!')
  let [schema, query] = args
  if (isEmpty(schema)) {
    schema = await select({
      message: print.__('Please select a schema:'),
      choices: map(schemas, s => ({ value: s.name }))
    })
  }
  if (isEmpty(query)) {
    query = await input({
      message: print.__('Please enter a query (if any):')
    })
  }
  const filter = { query }
  await postProcess.call(this, { noConfirmation: true, handler: 'recordCount', params: [schema, filter], path, processMsg: 'Counting record(s)', options })
}

export default findRecord
