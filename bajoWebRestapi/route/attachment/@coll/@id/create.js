import handleAttachmentUpload from '../../../../../lib/handle-attachment-upload.js'

async function create (ctx, req, reply) {
  const { coll, id } = req.params
  const { mimeType, stats } = req.query
  const result = await handleAttachmentUpload.call(this, { name: coll, id, options: { req, mimeType, stats } })
  return { data: result[0] }
}

export default create
