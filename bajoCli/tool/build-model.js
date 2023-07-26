import rebuildModel from './lib/rebuild-model.js'
import start from '../../bajo/start.js'

async function buildModel (path, args) {
  const { importPkg, print } = this.bajo.helper
  const { isEmpty, map, trim, find } = await importPkg('lodash-es')
  const [input, confirm, boxen, outmatch] = await importPkg('bajo-cli:@inquirer/input',
    'bajo-cli:@inquirer/confirm', 'bajo-cli:boxen', 'outmatch')
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
  await start.call(this, true)
  const result = { succed: 0, failed: 0, skipped: 0 }
  for (const s of schemas) {
    const schema = find(this.bajoDb.schemas, { name: s })
    const res = await rebuildModel.call(this, schema)
    if (res === null) result.skipped++
    else if (res) result.succed++
    else result.failed++
  }
  print.info('Done! Succeded: %d, failed: %s, skipped: %d', result.succed, result.failed, result.skipped)
}

export default buildModel
