import postProcess from './lib/post-process.js'

async function createRecord ({ path, args, options }) {
  const { importPkg, print, getConfig } = this.app.bajo
  const { isEmpty, map, isPlainObject, get } = this.app.bajo.lib._
  const [input, select, boxen] = await importPkg('bajoCli:@inquirer/input',
    'bajoCli:@inquirer/select', 'bajoCli:boxen')
  const config = getConfig()
  const schemas = get(this, 'bajoDb.schemas', [])
  if (isEmpty(schemas)) return print.fail('No schema found!', { exit: config.tool })
  let [schema, body] = args
  if (isEmpty(schema)) {
    schema = await select({
      message: print.write('Please select a schema:'),
      choices: map(schemas, s => ({ value: s.name }))
    })
  }
  if (isEmpty(body)) {
    body = await input({
      message: print.write('Enter JSON payload:'),
      validate: text => {
        if (isEmpty(text)) return print.write('Payload is required')
        try {
          const parsed = JSON.parse(text)
          if (!isPlainObject(parsed)) throw new Error()
        } catch (err) {
          return print.write('Payload must be a valid JSON object')
        }
        return true
      }
    })
  }
  let payload
  try {
    payload = JSON.parse(body)
  } catch (err) {
    return print.fail('Invalid payload syntax', { exit: config.tool })
  }
  console.log(boxen(JSON.stringify(payload, null, 2), { title: schema, padding: 0.5, borderStyle: 'round' }))
  await postProcess.call(this, { handler: 'recordCreate', params: [schema, payload], path, processMsg: 'Creating record', options })
}

export default createRecord
