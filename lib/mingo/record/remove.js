import getRecord from './get.js'
import pickRecord from '../../misc/pick-record.js'

async function removeRecord ({ schema, id, options = {} } = {}) {
  const { importPkg } = this.bajo.helper
  const { findIndex, pullAt } = await importPkg('lodash-es')
  const { thrownNotFound = true, fields } = options
  let rec = await getRecord.call(this, { schema, id, options: { thrownNotFound } })
  rec = await pickRecord.call(this, rec, fields)
  const idx = findIndex(this.bajoDb.memdb[schema.name], { id })
  pullAt(this.bajoDb.memdb[schema.name], [idx])
  return rec
}

export default removeRecord
