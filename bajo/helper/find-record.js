import knexFindRecord from '../../lib/knex/record/find.js'
import mingoFindRecord from '../../lib/mingo/record/find.js'
import getSchemaConnByName from '../../lib/misc/get-schema-conn-by-name.js'

const proxy = {
  knex: knexFindRecord,
  mingo: mingoFindRecord
}

async function findRecord (name, filter, options = {}) {
  const { schema, connection } = await getSchemaConnByName.call(this, name)
  return await proxy[connection.driver].call(this, { schema, filter, options })
}

export default findRecord
