import pickRecord from '../../misc/pick-record.js'

async function getRecord ({ schema, id, options = {} } = {}) {
  const { error, importPkg } = this.bajo.helper
  const { thrownNotFound = true, fields } = options
  const { find } = await importPkg('lodash-es')
  const result = find(this.bajoDb.memdb[schema.name], { id })
  if (!result && thrownNotFound) throw error('Record \'%s@%s\' not found!', id, schema.name)
  return await pickRecord.call(this, result, fields)
}

export default getRecord
