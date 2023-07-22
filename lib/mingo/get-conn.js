async function getConn (name) {
  const { importPkg } = this.bajo.helper
  const { find, isString } = await importPkg('lodash-es')
  const schema = isString(name) ? find(this.bajoDb.schemas, { name }) : name
  const conn = find(this.bajoDb.connections, { name: schema.connection })
  const mingo = find(this.bajoDb.instances, { name: schema.connection }).client
  return { mingo, conn, schema }
}

export default getConn
