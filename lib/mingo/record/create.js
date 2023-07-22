import sanitizeBody from '../../sanitizer/body.js'
import pickRecord from '../../misc/pick-record.js'
import getRecord from './get.js'

async function createRecord ({ schema, body, options = {} } = {}) {
  const { generateId, error } = this.bajo.helper
  const { fields } = options
  const newBody = await sanitizeBody.call(this, { body, schema })
  newBody.id = generateId()
  const exist = await getRecord.call(this, { schema, id: newBody.id, options: { thrownNotFound: false } })
  if (exist) throw error('Record \'%s@%s\' exists already!', newBody.id, schema.name)
  this.bajoDb.memdb[schema.name].push(newBody)
  return await pickRecord.call(this, newBody, fields)
}

export default createRecord
