import start from '../../bajo/start.js'
import addFixtures from '../../lib/add-fixtures.js'

async function buildModel (path, args) {
  const { importPkg, print, getConfig } = this.bajo.helper
  const { getInfo, repoExists, repoDrop, repoCreate } = this.bajoDb.helper
  const { isEmpty, map, trim } = await importPkg('lodash-es')
  const [input, confirm, boxen, outmatch] = await importPkg('bajo-cli:@inquirer/input',
    'bajo-cli:@inquirer/confirm', 'bajo-cli:boxen', 'outmatch', 'fs-extra')
  const config = getConfig()
  const schemas = map(this.bajoDb.schemas, 'name')
  let names = args.join(' ')
  if (isEmpty(schemas)) print.fatal('No schema found!')
  if (isEmpty(names)) {
    names = await input({
      message: print.__('Enter schema name(s), separated by space:'),
      default: '*'
    })
  }
  const isMatch = outmatch(map(names.split(' '), m => trim(m)))
  names = schemas.filter(isMatch)
  if (names.length === 0) print.fatal('No schema matched', true)
  console.log(boxen(names.join(' '), { title: print.__('Schema (%d)', names.length), padding: 0.5, borderStyle: 'round' }))
  const answer = await confirm({
    message: print.__('The above mentioned schema(s) will be rebuilt as repository. Continue?'),
    default: false
  })
  if (!answer) print.fatal('Aborted!')
  const conns = []
  for (const s of names) {
    const { connection } = await getInfo(s)
    if (!conns.includes(connection.name)) conns.push(connection.name)
  }
  await start.call(this, conns, true)
  const result = { succed: 0, failed: 0, skipped: 0 }
  for (const s of names) {
    const { schema, instance, connection } = await getInfo(s)
    const spinner = print.bora('Rebuilding \'%s\'...', schema.name).start()
    if (!instance) {
      spinner.warn('No need to rebuild \'%s@%s\'. Skipped!', schema.connection, schema.name)
      result.skipped++
      continue
    }
    const exists = await repoExists(schema)
    if (exists) {
      if (config.force) {
        try {
          await repoDrop(schema)
          spinner.setText('Model \'%s\' successfully dropped', schema.name)
        } catch (err) {
          spinner.fail('Error on dropping repository \'%s\': %s', schema.name, err.message)
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
      await repoCreate(schema)
      if (connection.memory) spinner.succeed('Model \'%s\' successfully created', schema.name)
      else {
        const fixture = await addFixtures.call(this, schema)
        spinner.succeed('Model \'%s\' successfully created, with fixture: added %d, rejected: %s', schema.name, fixture.success, fixture.failed)
      }
      result.succed++
    } catch (err) {
      spinner.fail('Error on creating \'%s\': %s', schema.name, err.message)
      result.failed++
    }
  }
  print.info('Done! Succeded: %d, failed: %s, skipped: %d', result.succed, result.failed, result.skipped)
}

export default buildModel
