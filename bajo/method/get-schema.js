function getSchema (input) {
  const { error, pascalCase } = this.app.bajo
  const { find, isPlainObject, cloneDeep } = this.app.bajo.lib._
  let name = isPlainObject(input) ? input.name : input
  name = pascalCase(name)
  const schema = find(this.bajoDb.schemas, { name })
  if (!schema) throw error('Unknown collection/schema \'%s\'', name)
  return cloneDeep(schema)
}

export default getSchema
