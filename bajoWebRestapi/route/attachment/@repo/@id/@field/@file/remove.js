async function remove (ctx, req, reply) {
  const { attachmentRemove } = this.bajoDb.helper
  const { repo, id, field, file } = req.params
  await attachmentRemove(repo, id, field, file)
  return {}
}

export default remove
