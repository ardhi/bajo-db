function preCheck (name) {
  const { pascalCase } = this.bajo.helper
  const { getSchema } = this.bajoDb.helper
  name = pascalCase(name)
  const schema = getSchema(name)
  if (!schema.attachment) return false
  return name
}

export default preCheck
