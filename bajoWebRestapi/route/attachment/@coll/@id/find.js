async function find (ctx, req, reply) {
  const { attachmentFind } = this.bajoDb.helper
  const { coll, id } = req.params
  const { mimeType, stats } = req.query
  const data = await attachmentFind(coll, id, { stats, mimeType })
  return { data }
}

export default find
