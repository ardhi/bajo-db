import postProcess from './lib/post-process.js'

async function createRecord (path, args, options) {
  const { importPkg, print } = this.bajo.helper
  const { isEmpty, map, isPlainObject, get } = await importPkg('lodash-es')
  const [input, select, boxen] = await importPkg('bajo-cli:@inquirer/input',
    'bajo-cli:@inquirer/select', 'bajo-cli:boxen')
  const schemas = get(this, 'bajoDb.schemas', [])
  if (isEmpty(schemas)) print.fatal('No schema found!')
  let [schema, body] = args
  if (isEmpty(schema)) {
    schema = await select({
      message: print.__('Please select a schema:'),
      choices: map(schemas, s => ({ value: s.name }))
    })
  }
  if (isEmpty(body)) {
    body = await input({
      message: print.__('Enter JSON payload:'),
      validate: text => {
        if (isEmpty(text)) return print.__('Payload is required')
        try {
          const parsed = JSON.parse(text)
          if (!isPlainObject(parsed)) throw new Error()
        } catch (err) {
          return print.__('Payload must be a valid JSON object')
        }
        return true
      }
    })
  }
  let payload
  try {
    payload = JSON.parse(body)
  } catch (err) {
    print.fatal('Invalid payload syntax')
  }
  console.log(boxen(JSON.stringify(payload, null, 2), { title: schema, padding: 0.5, borderStyle: 'round' }))
  await postProcess.call(this, { handler: 'recordCreate', params: [schema, payload], path, processMsg: 'Creating record', options })
}

export default createRecord
