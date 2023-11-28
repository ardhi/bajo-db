async function upsert (name, input, options = {}) {
  const { importPkg, generateId } = this.bajo.helper
  const { collExists, getInfo, sanitizeId, recordGet, recordCreate, recordUpdate } = this.bajoDb.helper
  const { find } = await importPkg('lodash-es')
  options.dataOnly = options.dataOnly ?? true
  await collExists(name, true)
  const { schema } = await getInfo(name)
  const idField = find(schema.properties, { name: 'id' })
  let id
  if (idField.type === 'string') id = input.id ?? generateId()
  else if (idField.type === 'integer') id = input.id ?? generateId('int')
  id = sanitizeId(id, schema)
  const old = await recordGet(name, id, { thrownNotFound: false, dataOnly: true, skipHook: true, skipCache: true })
  if (old) return await recordUpdate(name, id, input, options)
  return await recordCreate(name, input, options)
}

export default upsert
