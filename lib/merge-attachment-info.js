async function mergeAttachmentInfo (rec, source, { mimeType, stats, fullPath }) {
  const { fs, importPkg } = this.bajo.helper
  const { pick } = this.bajo.helper._
  if (!this.bajoWeb) return
  const mime = await importPkg('bajoWeb:mime')

  if (mimeType) rec.mimeType = mime.getType(rec.file)
  if (fullPath) rec.fullPath = source
  if (stats) {
    const s = fs.statSync(source)
    rec.stats = pick(s, ['size', 'atime', 'ctime', 'mtime'])
  }
}

export default mergeAttachmentInfo
