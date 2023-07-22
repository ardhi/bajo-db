import knexRemoveRecord from '../../lib/knex/record/remove.js'
import mingoRemoveRecord from '../../lib/mingo/record/remove.js'
import getSchemaConnByName from '../../lib/misc/get-schema-conn-by-name.js'

const proxy = {
  knex: knexRemoveRecord,
  mingo: mingoRemoveRecord
}

async function removeRecord (name, id, options = {}) {
  const { schema, connection } = await getSchemaConnByName.call(this, name)
  return await proxy[connection.driver].call(this, { schema, id, options })
}

export default removeRecord
