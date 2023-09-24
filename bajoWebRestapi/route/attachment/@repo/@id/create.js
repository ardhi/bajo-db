import handleAttachmentUpload from '../../../../../lib/handle-attachment-upload.js'

async function create (ctx, req, reply) {
  const { getInfo } = this.bajoDb.helper
  const { repo, id } = req.params
  const { mimeType, stats } = req.query
  const { schema } = await getInfo(repo)
  const result = await handleAttachmentUpload.call(this, { schema, id, options: { req, mimeType, stats } })
  return { data: result[0] }
}

export default create
