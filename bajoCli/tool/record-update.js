import postProcess from './lib/post-process.js'

async function updateRecord ({ path, args, options }) {
  const { importPkg, print, getConfig } = this.bajo.helper
  const { isEmpty, map, isPlainObject, get } = this.bajo.helper._
  const [input, select, boxen] = await importPkg('bajoCli:@inquirer/input',
    'bajoCli:@inquirer/select', 'bajoCli:boxen')
  const config = getConfig()
  const schemas = get(this, 'bajoDb.schemas', [])
  if (isEmpty(schemas)) return print.fail('No schema found!', { exit: config.tool })
  let [schema, id, body] = args
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
    return print.fail('Invalid payload syntax', { exit: config.tool })
  }
  console.log(boxen(JSON.stringify(payload, null, 2), { title: schema, padding: 0.5, borderStyle: 'round' }))
  await postProcess.call(this, { handler: 'recordUpdate', params: [schema, id, payload], path, processMsg: 'Updating record', options })
}

export default updateRecord
