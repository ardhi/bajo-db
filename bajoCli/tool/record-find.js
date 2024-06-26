import postProcess from './lib/post-process.js'

async function findRecord ({ path, args, options }) {
  const { importPkg, print, getConfig } = this.bajo.helper
  const { isEmpty, map, get, pick } = this.bajo.helper._
  const [select, input] = await importPkg('bajoCli:@inquirer/select', 'bajoCli:@inquirer/input')
  const config = getConfig()
  const schemas = get(this, 'bajoDb.schemas', [])
  if (isEmpty(schemas)) return print.fail('No schema found!', { exit: config.tool })
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
  if (isEmpty(query)) query = {}
  const filter = pick(config, ['page', 'offset', 'pageSize', 'sort', 'limit'])
  filter.pageSize = filter.pageSize ?? filter.limit
  filter.query = query
  await postProcess.call(this, { noConfirmation: true, handler: 'recordFind', params: [schema, filter], path, processMsg: 'Finding record(s)', options })
}

export default findRecord
