import postProcess from './lib/post-process.js'

async function removeRecord ({ path, args, options }) {
  const { importPkg, print, getConfig } = this.app.bajo
  const { isEmpty, map, get } = this.app.bajo.lib._
  const [input, select] = await importPkg('bajoCli:@inquirer/input', 'bajoCli:@inquirer/select')
  const config = getConfig()
  const schemas = get(this, 'bajoDb.schemas', [])
  if (isEmpty(schemas)) return print.fail('No schema found!', { exit: config.tool })
  let [schema, id] = args
  if (isEmpty(schema)) {
    schema = await select({
      message: print.write('Please select a schema:'),
      choices: map(schemas, s => ({ value: s.name }))
    })
  }
  if (isEmpty(id)) {
    id = await input({
      message: print.write('Enter record ID:'),
      validate: text => isEmpty(text) ? print.write('ID is required') : true
    })
  }
  await postProcess.call(this, { handler: 'recordRemove', params: [schema, id], path, processMsg: 'Removing record', options })
}

export default removeRecord
