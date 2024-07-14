function getInfo (name) {
  const { breakNsPath } = this.app.bajo
  const { getSchema } = this.bajoDb.helper
  const { find, map } = this.app.bajo.lib._
  const schema = getSchema(name)
  const conn = find(this.bajoDb.connections, { name: schema.connection })
  const [plugin, type] = breakNsPath(conn.type)
  const driver = find(this.bajoDb.drivers, { type, plugin, driver: conn.driver })
  const instance = find(this[driver.plugin].instances, { name: schema.connection })
  const opts = conn.type === 'mssql' ? { includeTriggerModifications: true } : undefined
  const returning = [map(schema.properties, 'name'), opts]
  return { instance, driver, connection: conn, returning, schema }
}

export default getInfo
