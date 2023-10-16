async function getSchema (name) {
  const { importPkg, error, pascalCase } = this.bajo.helper
  const { find, isPlainObject, cloneDeep } = await importPkg('lodash-es')
  if (isPlainObject(name)) name = name.name
  name = pascalCase(name)
  const schema = find(this.bajoDb.schemas, { name })
  if (!schema) throw error('Unknown coll/schema \'%s\'', name)
  return cloneDeep(schema)
}

export default getSchema
