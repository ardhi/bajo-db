import handleAttachmentUpload from '../../../../../lib/handle-attachment-upload.js'

async function create (ctx, req, reply) {
  const { repo, id } = req.params
  const { mimeType, stats } = req.query
  const result = await handleAttachmentUpload.call(this, { name: repo, id, options: { req, mimeType, stats } })
  return { data: result[0] }
}

export default create
