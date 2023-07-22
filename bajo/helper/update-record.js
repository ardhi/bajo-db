import knexUpdateRecord from '../../lib/knex/record/update.js'
import mingoUpdateRecord from '../../lib/mingo/record/update.js'
import getSchemaConnByName from '../../lib/misc/get-schema-conn-by-name.js'

const proxy = {
  knex: knexUpdateRecord,
  mingo: mingoUpdateRecord
}

async function updateRecord (name, id, body, options = {}) {
  const { schema, connection } = await getSchemaConnByName.call(this, name)
  return await proxy[connection.driver].call(this, { schema, id, body, options })
}

export default updateRecord
