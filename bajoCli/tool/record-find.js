import postProcess from './lib/post-process.js'

async function findRecord ({ path, args, options }) {
  const { importPkg, print, getConfig } = this.app.bajo
  const { isEmpty, map, get, pick } = this.app.bajo.lib._
  const [select, input] = await importPkg('bajoCli:@inquirer/select', 'bajoCli:@inquirer/input')
  const config = getConfig()
  const schemas = get(this, 'bajoDb.schemas', [])
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
  if (isEmpty(query)) query = {}
  const filter = pick(config, ['page', 'offset', 'pageSize', 'sort', 'limit'])
  filter.pageSize = filter.pageSize ?? filter.limit
  filter.query = query
  await postProcess.call(this, { noConfirmation: true, handler: 'recordFind', params: [schema, filter], path, processMsg: 'Finding record(s)', options })
}

export default findRecord
