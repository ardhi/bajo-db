const dialects = ['better-sqlite3', 'cockroachdb', 'mssql', 'mysql', 'mysql2',
  'oracle', 'oracledb', 'pgnative', 'postgres', 'redshift', 'sqlite3']

async function connection () {
  const { importPkg, log, getConfig, error, runHook } = this.bajo.helper
  const { isPlainObject } = await importPkg('lodash-es::bajo')
  const config = getConfig('bajoDb')
  config.connections = config.connections || []
  if (isPlainObject(config.connections)) config.connections = [config.connections]
  if (config.connections.length === 0) {
    log.warn(`No database connection found`)
    return
  }
  for (const c of config.connections) {
    if (!dialects.includes(c.type)) throw error(`Unsupported db type '${c.type}'`, { code: 'BAJODB_UNSUPPORTED_DB_TYPE' })
    try {
      await require(`./sanitize/${c.type}`).call(this, c)
    } catch (err) {
    }
  }
  // await runHook('bajoDb:')
}

export default connection
