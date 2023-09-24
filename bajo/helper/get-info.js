async function getInfo (name) {
  const { importPkg, error, pascalCase } = this.bajo.helper
  const { find, map, isPlainObject } = await importPkg('lodash-es')
  if (isPlainObject(name)) name = name.name
  name = pascalCase(name)
  const schema = find(this.bajoDb.schemas, { name })
  if (!schema) throw error('Unknown repo/schema \'%s\'', name)
  const conn = find(this.bajoDb.connections, { name: schema.connection })
  const driver = find(this.bajoDb.drivers, { type: conn.type, driver: conn.driver })
  const instance = find(this[driver.provider].instances, { name: schema.connection })
  const opts = conn.type === 'mssql' ? { includeTriggerModifications: true } : undefined
  const returning = [map(schema.properties, 'name'), opts]
  return { instance, driver, connection: conn, returning, schema }
}

export default getInfo
