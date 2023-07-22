import knexCreateRecord from '../../lib/knex/record/create.js'
import mingoCreateRecord from '../../lib/mingo/record/create.js'
import getSchemaConnByName from '../../lib/misc/get-schema-conn-by-name.js'

const proxy = {
  knex: knexCreateRecord,
  mingo: mingoCreateRecord
}

async function createRecord (name, body, options = {}) {
  const { schema, connection } = await getSchemaConnByName.call(this, name)
  return await proxy[connection.driver].call(this, { schema, body, options })
}

export default createRecord
