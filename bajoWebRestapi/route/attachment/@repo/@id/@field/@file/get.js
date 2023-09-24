async function get (ctx, req, reply) {
  const { attachmentGet } = this.bajoDb.helper
  const { repo, id, field, file } = req.params
  const { mimeType, stats } = req.query
  return { data: await attachmentGet(repo, id, field, file, { stats, mimeType }) }
}

export default get
