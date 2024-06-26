import addFixtures from '../lib/add-fixtures.js'

async function start (conns = 'all', noRebuild = true) {
  const { importModule, log, breakNsPath } = this.bajo.helper
  const { find, filter, isString, map } = this.bajo.helper._
  if (conns === 'all') conns = this.bajoDb.connections
  else if (isString(conns)) conns = filter(this.bajoDb.connections, { name: conns })
  else conns = map(conns, c => find(this.bajoDb.connections, { name: c }))
  for (const c of conns) {
    const [plugin] = breakNsPath(c.type)
    const schemas = filter(this.bajoDb.schemas, { connection: c.name })
    const mod = await importModule(`${plugin}:/bajoDb/boot/instantiation.js`)
    await mod.call(this, { connection: c, noRebuild, schemas })
    for (const s of schemas) {
      if (c.memory) await addFixtures.call(this, s.name)
    }
    log.trace('Driver \'%s@%s\' instantiated', c.driver, c.name)
  }
}

export default start
