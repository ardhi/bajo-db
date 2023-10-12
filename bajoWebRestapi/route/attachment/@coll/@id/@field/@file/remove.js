async function remove (ctx, req, reply) {
  const { attachmentRemove } = this.bajoDb.helper
  const { coll, id, field, file } = req.params
  await attachmentRemove(coll, id, field, file)
  return {}
}

export default remove
