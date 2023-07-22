import knex from 'knex'
import createTable from './table/create.js'

async function start (opts, noRebuild) {
  const { importPkg, log, fatal } = this.bajo.helper
  const { merge, omit, pick, filter } = await importPkg('lodash-es')
  const Dialect = (await import(`knex/lib/dialects/${opts.client}/index.js`)).default
  const driver = await importPkg('app:sqlite3')
  Dialect.prototype._driver = () => driver
  const client = knex(merge({}, omit(opts, ['name', 'driver']), { log, client: Dialect }))
  const instance = pick(opts, ['name', 'driver', 'type', 'memory'])
  instance.client = client
  this.bajoDb.instances.push(instance)
  // make sure connection is established
  try {
    await client.raw('SELECT 1')
    log.info('\'%s\' is connected', opts.name)
  } catch (err) {
    log.error('Error on \'%s\': %s', opts.name, err.message)
  }
  if (noRebuild) return
  const schemas = filter(this.bajoDb.schemas, { connection: opts.name })
  for (const schema of schemas) {
    const exists = await client.schema.hasTable(schema.collName)
    if (!exists || instance.memory) {
      try {
        await createTable.call(this, { schema, instance })
        log.trace('Model \'%s@%s\' successfully built on the fly', schema.name, opts.name)
      } catch (err) {
        fatal('Unable to build model \'%s@%s\': %s', schema.name, opts.name, err.message)
      }
    }
  }
}

export default start
