function getSchema (input) {
  const { error, pascalCase } = this.bajo.helper
  const { find, isPlainObject, cloneDeep } = this.bajo.helper._
  let name = isPlainObject(input) ? input.name : input
  name = pascalCase(name)
  const schema = find(this.bajoDb.schemas, { name })
  if (!schema) throw error('Unknown coll/schema \'%s\'', name)
  return cloneDeep(schema)
}

export default getSchema
