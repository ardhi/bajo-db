import postProcess from './lib/post-process.js'

async function getRecord ({ path, args, options }) {
  const { importPkg } = this.app.bajo
  const { isEmpty, map, get } = this.app.bajo.lib._
  const [input, select] = await importPkg('bajoCli:@inquirer/input', 'bajoCli:@inquirer/select')
  const schemas = get(this, 'bajoDb.schemas', [])
  if (isEmpty(schemas)) return this.print.fail('No schema found!', { exit: this.app.bajo.toolMode })
  let [schema, id] = args
  if (isEmpty(schema)) {
    schema = await select({
      message: this.print.write('Please select a schema:'),
      choices: map(schemas, s => ({ value: s.name }))
    })
  }
  if (isEmpty(id)) {
    id = await input({
      message: this.print.write('Enter record ID:'),
      validate: text => isEmpty(text) ? this.print.write('ID is required') : true
    })
  }
  await postProcess.call(this, { noConfirmation: true, handler: 'recordGet', params: [schema, id], path, processMsg: 'Getting record', options })
}

export default getRecord
