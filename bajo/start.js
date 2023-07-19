import knex from 'knex'

async function start () {
  const { importPkg, log } = this.bajo.helper
  const { merge, omit } = await importPkg('lodash-es')
  const instances = []

  for (const opts of (this.bajoDb.connections || [])) {
    const Dialect = (await import(`knex/lib/dialects/${opts.client}/index.js`)).default
    const driver = await importPkg('app:sqlite3')
    Dialect.prototype._driver = () => driver
    const client = knex(merge({}, omit(opts, ['name', 'driver']), { log, client: Dialect }))
    instances.push({ name: opts.name, type: opts.type, client })
    // make sure connection is established
    try {
      await client.raw('SELECT 1')
      log.info('\'%s\' is connected', opts.name)
    } catch (err) {
      log.error('Error on \'%s\': %s', opts.name, err.message)
    }
  }
  this.bajoDb.instances = instances
}

export default start
