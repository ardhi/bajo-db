function sanitizeId (id, schema) {
  const prop = schema.properties.find(p => p.name === 'id')
  if (['integer', 'smallint', 'bigint'].includes(prop.type)) id = parseInt(id)
  return id
}

export default sanitizeId
