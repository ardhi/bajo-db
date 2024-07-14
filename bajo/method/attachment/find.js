import mergeAttachmentInfo from '../../../lib/merge-attachment-info.js'

async function find (name, id, options = {}) {
  const { fastGlob, fs, getPluginDataDir } = this.app.bajo
  const { attachmentPreCheck } = this.bajoDb.helper
  name = attachmentPreCheck(name)
  if (!name) return
  const dir = `${getPluginDataDir('bajoDb')}/attachment/${name}/${id}`
  if (!fs.existsSync(dir)) return []
  const files = await fastGlob(`${dir}/**/*`)
  const { fullPath, stats, mimeType } = options
  const recs = []
  for (const f of files) {
    const item = f.replace(dir, '')
    let [, field, file] = item.split('/')
    if (!file) {
      file = field
      field = null
    }
    const rec = { field, file }
    await mergeAttachmentInfo.call(this, rec, f, { mimeType, fullPath, stats })
    recs.push(rec)
  }
  return recs
}

export default find
