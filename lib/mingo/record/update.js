import sanitizeBody from '../../sanitizer/body.js'
import getRecord from './get.js'
import pickRecord from '../../misc/pick-record.js'

async function updateRecord ({ schema, id, body, options } = {}) {
  const { importPkg } = this.bajo.helper
  const { findIndex, merge } = await importPkg('lodash-es')
  const { thrownNotFound = true, returnOldNew, fields } = options
  let old = await getRecord.call(this, { schema, id, options: { thrownNotFound } })
  old = await pickRecord.call(this, old, fields)
  const newBody = await sanitizeBody.call(this, { body, schema, partial: true })
  delete newBody.id
  const idx = findIndex(this.bajoDb.memdb[schema.name], { id })
  const current = this.bajoDb.memdb[schema.name][idx]
  this.bajoDb.memdb[schema.name][idx] = merge(current, newBody)
  let result = this.bajoDb.memdb[schema.name][idx]
  result = await pickRecord.call(this, result, fields)
  if (returnOldNew) return { old, new: result }
  return result
}

export default updateRecord
