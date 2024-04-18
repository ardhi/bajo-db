async function get (name, id, field, file, options = {}) {
  const { error } = this.bajo.helper
  const { attachmentPreCheck, attachmentFind } = this.bajoDb.helper
  name = attachmentPreCheck(name)
  if (!name) return
  const { find } = this.bajo.helper._
  const all = await attachmentFind(name, id, options)
  if (field === 'null') field = null
  const data = find(all, { field, file })
  if (!data) throw error('notfound', { statusCode: 404 })
  return data
}

export default get
