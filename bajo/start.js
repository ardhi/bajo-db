import addFixtures from '../lib/add-fixtures.js'

async function start (conns = 'all', noRebuild = true) {
  const { importModule, breakNsPath } = this.app.bajo
  const { find, filter, isString, map } = this.app.bajo.lib._
  if (conns === 'all') conns = this.connections
  else if (isString(conns)) conns = filter(this.connections, { name: conns })
  else conns = map(conns, c => find(this.connections, { name: c }))
  for (const c of conns) {
    const [ns] = breakNsPath(c.type)
    const schemas = filter(this.schemas, { connection: c.name })
    const mod = await importModule(`${ns}:/bajoDb/boot/instantiation.js`)
    await mod.call(this, { connection: c, noRebuild, schemas })
    for (const s of schemas) {
      if (c.memory) await addFixtures.call(this, s.name)
    }
    this.log.trace('Driver \'%s@%s\' instantiated', c.driver, c.name)
  }
}

export default start
