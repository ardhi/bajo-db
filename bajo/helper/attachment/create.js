import mergeAttachmentInfo from '../../../lib/merge-attachment-info.js'

async function create (name, id, options = {}) {
  const { error, importPkg } = this.bajo.helper
  const { attachmentGetPath } = this.bajoDb.helper
  const fs = await importPkg('fs-extra')
  const { source, field, file } = options
  if (!source) throw error('Invalid source')
  const baseDir = await attachmentGetPath(name, id, field, file, { dirOnly: true })
  const { fullPath, stats, mimeType } = options

  let dir = `${baseDir}/${field}`
  if ((field || '').endsWith('[]')) dir = `${baseDir}/${field.replace('[]', '')}`
  const dest = `${dir}/${file}`.replaceAll('//', '/')
  await fs.ensureDir(dir)
  await fs.copy(source, dest)
  const rec = {
    field: field === '' ? undefined : field,
    dir,
    file
  }
  await mergeAttachmentInfo.call(this, rec, dest, { mimeType, fullPath, stats })
  return rec
}

export default create
