import handleAttachmentUpload from '../../../../../../../lib/handle-attachment-upload.js'

async function update (ctx, req, reply) {
  const { attachmentRemove } = this.bajoDb.helper
  const { coll, id, field, file } = req.params
  const { mimeType, stats } = req.query
  await attachmentRemove(coll, id, field, file)
  const result = await handleAttachmentUpload.call(this, { name: coll, id, options: { req, mimeType, stats, setField: field, setFile: file } })
  return { data: result[0] }
}

export default update
