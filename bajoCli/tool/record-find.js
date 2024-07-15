import postProcess from './lib/post-process.js'

async function findRecord ({ path, args, options }) {
  const { importPkg } = this.app.bajo
  const { isEmpty, map, get, pick } = this.app.bajo.lib._
  const [select, input] = await importPkg('bajoCli:@inquirer/select', 'bajoCli:@inquirer/input')
  const schemas = get(this, 'bajoDb.schemas', [])
  if (isEmpty(schemas)) return this.print.fail('No schema found!', { exit: this.app.bajo.toolMode })
  let [schema, query] = args
  if (isEmpty(schema)) {
    schema = await select({
      message: this.print.write('Please select a schema:'),
      choices: map(schemas, s => ({ value: s.name }))
    })
  }
  if (isEmpty(query)) {
    query = await input({
      message: this.print.write('Please enter a query (if any):')
    })
  }
  if (isEmpty(query)) query = {}
  const filter = pick(this.app.bajo.config, ['page', 'offset', 'pageSize', 'sort', 'limit'])
  filter.pageSize = filter.pageSize ?? filter.limit
  filter.query = query
  await postProcess.call(this, { noConfirmation: true, handler: 'recordFind', params: [schema, filter], path, processMsg: 'Finding record(s)', options })
}

export default findRecord
