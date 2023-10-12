async function get (ctx, req, reply) {
  const { attachmentGet } = this.bajoDb.helper
  const { coll, id, field, file } = req.params
  const { mimeType, stats } = req.query
  return { data: await attachmentGet(coll, id, field, file, { stats, mimeType }) }
}

export default get
