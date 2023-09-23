async function get (ctx, req, reply) {
  const { importPkg } = this.bajo.helper
  const { attachmentGet } = this.bajoDb.helper
  const { filter, isEmpty } = await importPkg('lodash-es')
  const { repo, id } = req.params
  const pattern = req.params['*']
  const { mimeType, stats } = req.query
  let ret = await attachmentGet(repo, id, { stats, mimeType })
  if (!isEmpty(ret)) {
    // TODO: use outmatch
    const parts = pattern.split('/')
    let [field, file] = parts
    if (parts.length === 1) {
      file = field
      field = null
    }
    const where = { field }
    if (!isEmpty(file)) where.file = file
    ret = filter(ret, where)
  }
  return {
    data: ret
  }
}

export default get
