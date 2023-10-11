async function getInfo (name) {
  const { importPkg } = this.bajo.helper
  const { getSchema } = this.bajoDb.helper
  const { find, map } = await importPkg('lodash-es')
  const schema = await getSchema(name)
  const conn = find(this.bajoDb.connections, { name: schema.connection })
  const driver = find(this.bajoDb.drivers, { type: conn.type, driver: conn.driver })
  const instance = find(this[driver.provider].instances, { name: schema.connection })
  const opts = conn.type === 'mssql' ? { includeTriggerModifications: true } : undefined
  const returning = [map(schema.properties, 'name'), opts]
  return { instance, driver, connection: conn, returning, schema }
}

export default getInfo
