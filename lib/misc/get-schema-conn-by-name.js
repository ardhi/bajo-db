async function getSchemaConnByName (name, thrown = true) {
  const { importPkg, error } = this.bajo.helper
  const { find } = await importPkg('lodash-es')
  const schema = find(this.bajoDb.schemas, { name })
  if (!schema && thrown) throw error('Unknown schema \'%s\'', name)
  const connection = find(this.bajoDb.connections, { name: schema.connection })
  return { schema, connection }
}

export default getSchemaConnByName
