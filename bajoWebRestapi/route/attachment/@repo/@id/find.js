async function find (ctx, req, reply) {
  const { attachmentFind } = this.bajoDb.helper
  const { repo, id } = req.params
  const { mimeType, stats } = req.query
  const data = await attachmentFind(repo, id, { stats, mimeType })
  return { data }
}

export default find
