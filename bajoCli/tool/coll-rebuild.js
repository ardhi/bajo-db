import start from '../../bajo/start.js'

async function buildModel (path, args) {
  const { importPkg, print, getConfig } = this.bajo.helper
  const { getInfo, collExists, collDrop, collCreate } = this.bajoDb.helper
  const { isEmpty, map, trim } = await importPkg('lodash-es')
  const [input, confirm, boxen, outmatch] = await importPkg('bajo-cli:@inquirer/input',
    'bajo-cli:@inquirer/confirm', 'bajo-cli:boxen', 'outmatch', 'fs-extra')
  const config = getConfig()
  const schemas = map(this.bajoDb.schemas, 'name')
  let models = args.join(' ')
  if (isEmpty(schemas)) print.fatal('No schema found!')
  if (isEmpty(models)) {
    models = await input({
      message: print.__('Enter schema name(s), separated by space:'),
      default: '*'
    })
  }
  const isMatch = outmatch(map(models.split(' '), m => trim(m)))
  models = schemas.filter(isMatch)
  if (models.length === 0) print.fatal('No schema matched', true)
  console.log(boxen(models.join(' '), { title: print.__('Schema (%d)', models.length), padding: 0.5, borderStyle: 'round' }))
  const answer = await confirm({ message: print.__('The above mentioned schema(s) will be rebuilt & modeled. Continue?') })
  if (!answer) print.fatal('Aborted!')
  const conns = []
  for (const s of models) {
    const { connection } = await getInfo(s)
    if (!conns.includes(connection.name)) conns.push(connection.name)
  }
  await start.call(this, conns, true)
  const result = { succed: 0, failed: 0, skipped: 0 }
  for (const s of models) {
    const { schema, instance } = await getInfo(s)
    const spinner = print.bora('Rebuilding \'%s\'...', schema.name).start()
    if (!instance) {
      spinner.warn('No need to rebuild \'%s@%s\'. Skipped!', schema.connection, schema.name)
      result.skipped++
      continue
    }
    const exists = await collExists(schema, true)
    if (exists) {
      if (config.force) {
        try {
          await collDrop(schema)
          spinner.setText('Model \'%s\' successfully dropped', schema.name)
        } catch (err) {
          spinner.fail('Error on dropping model \'%s\': %s', schema.name, err.message)
          result.failed++
          continue
        }
      } else {
        spinner.fail('Model \'%s\' exists. Won\'t rebuild without --force', schema.name)
        result.failed++
        continue
      }
    }
    try {
      await collCreate(schema)
      spinner.succeed('Model \'%s\' successfully created', schema.name)
      result.succed++
    } catch (err) {
      spinner.fail('Error on creating \'%s\': %s', schema.name, err.message)
      result.failed++
    }
  }
  print.info('Done! Succeded: %d, failed: %s, skipped: %d', result.succed, result.failed, result.skipped)
}

export default buildModel
