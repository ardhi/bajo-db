async function getInfo (name) {
  const { importPkg, error } = this.bajo.helper
  const { find, isString } = await importPkg('lodash-es')
  const schema = isString(name) ? find(this.bajoDb.schemas, { name }) : name
  if (!schema) throw error('Can\'t find schema \'%s\'', schema.name)
  const conn = find(this.bajoDb.connections, { name: schema.connection })
  const driver = find(this.bajoDb.drivers, { type: conn.type, driver: conn.driver })
  return { conn, schema, driver }
}

export default getInfo
