async function upsert (name, input, opts = {}) {
  const { generateId } = this.bajo.helper
  const { collExists, getInfo, sanitizeId, recordGet, recordCreate, recordUpdate } = this.bajoDb.helper
  const { find } = this.bajo.helper._
  const { cloneDeep } = this.bajo.helper._
  const options = cloneDeep(opts)
  options.dataOnly = options.dataOnly ?? true
  await collExists(name, true)
  const { schema } = getInfo(name)
  const idField = find(schema.properties, { name: 'id' })
  let id
  if (idField.type === 'string') id = input.id ?? generateId()
  else if (idField.type === 'integer') id = input.id ?? generateId('int')
  id = sanitizeId(id, schema)
  const old = await recordGet(name, id, { thrownNotFound: false, dataOnly: true, noHook: true, noCache: true })
  if (old) return await recordUpdate(name, id, input, options)
  return await recordCreate(name, input, options)
}

export default upsert
