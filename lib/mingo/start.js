async function start (opts) {
  const { importPkg } = this.bajo.helper
  const { filter, pick } = await importPkg('lodash-es')
  this.bajoDb.memdb = {}
  const schemas = filter(this.bajoDb.schemas, { connection: opts.name })
  for (const schema of schemas) {
    this.bajoDb.memdb[schema.name] = [] // init empty coll
  }
  const mingo = await importPkg('bajo-db:mingo')
  mingo.setup({ key: 'id' })
  const client = mingo
  const instance = pick(opts, ['name', 'driver', 'type', 'memory'])
  instance.client = client
  this.bajoDb.instances.push(instance)
}

export default start
