async function get (name, id, field, file, options = {}) {
  const { importPkg, error } = this.bajo.helper
  const { attachmentFind } = this.bajoDb.helper
  const { find } = await importPkg('lodash-es')
  const all = await attachmentFind(name, id, options)
  if (field === 'null') field = null
  const data = find(all, { field, file })
  if (!data) throw error('notfound', { statusCode: 404 })
  return data
}

export default get
