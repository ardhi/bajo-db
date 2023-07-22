import createTable from '../../../lib/knex/table/create.js'

async function rebuildModelKnex ({ schema, instance, spinner }) {
  const { getConfig } = this.bajo.helper
  const config = getConfig()
  const knex = instance.client
  const exist = await knex.schema.hasTable(schema.collName)
  if (exist) {
    if (config.force) {
      try {
        await knex.schema.dropTable(schema.collName)
        spinner.setText('Model \'%s\' successfully dropped', schema.name)
      } catch (err) {
        spinner.fail('Error on dropping model \'%s\': %s', schema.name, err.message)
        return false
      }
    } else {
      spinner.fail('Model \'%s\' exists. Won\'t rebuild without --force', schema.name)
      return false
    }
  }
  try {
    await createTable.call(this, { schema, instance })
    spinner.succeed('Model \'%s\' successfully created', schema.name)
    return true
  } catch (err) {
    spinner.fail('Error on creating \'%s\': %s', schema.name, err.message)
    return false
  }
}

export default rebuildModelKnex
