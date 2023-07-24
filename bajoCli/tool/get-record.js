import postProcess from './lib/post-process.js'

async function getRecord (path, args) {
  const { importPkg, print } = this.bajo.helper
  const { isEmpty, map, get } = await importPkg('lodash-es')
  const [input, select] = await importPkg('bajo-cli:@inquirer/input', 'bajo-cli:@inquirer/select')
  const schemas = get(this, 'bajoDb.schemas', [])
  if (isEmpty(schemas)) print.fatal('No schema found!')
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
  await postProcess.call(this, { noConfirm: true, handler: 'recordGet', params: [schema, id], path, processMsg: 'Getting record' })
}

export default getRecord
