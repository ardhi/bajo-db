async function mergeAttachmentInfo (rec, source, { mimeType, stats, fullPath }) {
  const { importPkg } = this.bajo.helper
  const { pick } = await importPkg('lodash-es')
  const [fs, mime] = await importPkg('fs-extra', 'bajo-web:mime')

  if (mimeType) rec.mimeType = mime.getType(rec.file)
  if (fullPath) rec.fullPath = source
  if (stats) {
    const s = fs.statSync(source)
    rec.stats = pick(s, ['size', 'atime', 'ctime', 'mtime'])
  }
}

export default mergeAttachmentInfo
