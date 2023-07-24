import postProcess from './lib/post-process.js'

async function findRecord (path, args) {
  const { importPkg, print, getConfig } = this.bajo.helper
  const { isEmpty, map, get, pick } = await importPkg('lodash-es')
  const [select, input] = await importPkg('bajo-cli:@inquirer/select', 'bajo-cli:@inquirer/input')
  const config = getConfig()
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
  const filter = pick(config, ['page', 'offset', 'pageSize', 'sort'])
  filter.pageSize = filter.pageSize || filter.limit
  filter.query = query
  await postProcess.call(this, { noConfirm: true, handler: 'recordFind', params: [schema, filter], path, processMsg: 'Finding record(s)' })
}

export default findRecord
