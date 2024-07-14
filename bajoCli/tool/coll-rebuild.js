import addFixtures from '../../lib/add-fixtures.js'

async function collRebuild ({ path, args }) {
  const { importPkg, print, getConfig, spinner, startPlugin, outmatch } = this.app.bajo
  const { getInfo, collExists, collDrop, collCreate } = this.bajoDb.helper
  const { isEmpty, map, trim } = this.app.bajo.lib._
  const [input, confirm, boxen] = await importPkg('bajoCli:@inquirer/input',
    'bajoCli:@inquirer/confirm', 'bajoCli:boxen')
  const config = getConfig()
  const schemas = map(this.bajoDb.schemas, 'name')
  let names = args.join(' ')
  if (isEmpty(schemas)) return print.fail('No schema found!', { exit: config.tool })
  if (isEmpty(names)) {
    names = await input({
      message: print.write('Enter schema name(s), separated by space:'),
      default: '*'
    })
  }
  const isMatch = outmatch(map(names.split(' '), m => trim(m)))
  names = schemas.filter(isMatch)
  if (names.length === 0) return print.fail('No schema matched', true, { exit: config.tool })
  names = names.sort()
  console.log(boxen(names.join(' '), { title: print.write('Schema (%d)', names.length), padding: 0.5, borderStyle: 'round' }))
  const answer = await confirm({
    message: print.write('The above mentioned schema(s) will be rebuilt as collection. Continue?'),
    default: false
  })
  if (!answer) return print.fail('Aborted!', { exit: config.tool })
  const conns = []
  for (const s of names) {
    const { connection } = getInfo(s)
    if (!conns.includes(connection.name)) conns.push(connection.name)
  }
  await startPlugin('bajoDb', conns)
  const result = { succed: 0, failed: 0, skipped: 0 }
  for (const s of names) {
    const { schema, instance, connection } = getInfo(s)
    const spin = spinner({ showCounter: true }).start('Rebuilding \'%s\'...', schema.name)
    if (!instance) {
      spin.warn('Client instance not connected \'%s@%s\'. Skipped!', schema.connection, schema.name)
      result.skipped++
      continue
    }
    const exists = await collExists(schema, false, spinner)
    if (exists) {
      if (config.force) {
        try {
          await collDrop(schema, spinner)
          spin.setText('Collection \'%s\' successfully dropped', schema.name)
        } catch (err) {
          spin.fail('Error on dropping collection \'%s\': %s', schema.name, err.message)
          result.failed++
          continue
        }
      } else {
        spin.fail('Collection \'%s\' exists. Won\'t rebuild without --force', schema.name)
        result.failed++
        continue
      }
    }
    try {
      await collCreate(schema, spinner)
      if (connection.memory) spin.succeed('Collection \'%s\' successfully created', schema.name)
      else {
        const fixture = await addFixtures.call(this, schema, spin)
        spin.succeed('Collection \'%s\' successfully created, with fixture: added %d, rejected: %s', schema.name, fixture.success, fixture.failed)
      }
      result.succed++
    } catch (err) {
      if (config.log.tool && config.log.level === 'trace') console.error(err)
      spin.fail('Error on creating \'%s\': %s', schema.name, err.message)
      result.failed++
    }
  }
  print.info('Done! Succeded: %d, failed: %s, skipped: %d', result.succed, result.failed, result.skipped)
}

export default collRebuild
