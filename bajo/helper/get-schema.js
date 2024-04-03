async function getSchema (input) {
  const { importPkg, error, pascalCase } = this.bajo.helper
  const { find, isPlainObject, cloneDeep } = await importPkg('lodash-es')
  let name = isPlainObject(input) ? input.name : input
  name = pascalCase(name)
  const schema = find(this.bajoDb.schemas, { name })
  if (!schema) throw error('Unknown coll/schema \'%s\'', name)
  return cloneDeep(schema)
}

export default getSchema
