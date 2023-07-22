async function getConn (name) {
  const { importPkg } = this.bajo.helper
  const { find, isString, map } = await importPkg('lodash-es')
  const schema = isString(name) ? find(this.bajoDb.schemas, { name }) : name
  const conn = find(this.bajoDb.connections, { name: schema.connection })
  const knex = find(this.bajoDb.instances, { name: schema.connection }).client
  const opts = conn.type === 'mssql' ? { includeTriggerModifications: true } : undefined
  const returning = [map(schema.properties, 'name'), opts]
  return { knex, conn, schema, returning }
}

export default getConn
