async function getInfo (name) {
  const { importPkg, error } = this.bajo.helper
  const { find, map, isString } = await importPkg('lodash-es')
  const schema = isString(name) ? find(this.bajoDb.schemas, { name }) : name
  if (!schema) throw error('Unknown schema \'%s\'', name)
  const conn = find(this.bajoDb.connections, { name: schema.connection })
  const driver = find(this.bajoDb.drivers, { type: conn.type, driver: conn.driver })
  const instance = find(this[driver.provider].instances, { name: schema.connection })
  const opts = conn.type === 'mssql' ? { includeTriggerModifications: true } : undefined
  const returning = [map(schema.properties, 'name'), opts]
  return { instance, driver, connection: conn, returning, schema }
}

export default getInfo
