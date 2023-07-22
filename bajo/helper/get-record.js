import knexGetRecord from '../../lib/knex/record/get.js'
import mingoGetRecord from '../../lib/mingo/record/get.js'
import getSchemaConnByName from '../../lib/misc/get-schema-conn-by-name.js'

const proxy = {
  knex: knexGetRecord,
  mingo: mingoGetRecord
}

async function getRecord (name, id, options = {}) {
  const { schema, connection } = await getSchemaConnByName.call(this, name)
  return await proxy[connection.driver].call(this, { schema, id, options })
}

export default getRecord
