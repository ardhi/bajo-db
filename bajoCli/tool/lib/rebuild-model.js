import rebuildModelKnex from './rebuild-model-knex.js'

const modeler = {
  knex: rebuildModelKnex
}

async function rebuildModel (schema) {
  const { importPkg, print } = this.bajo.helper
  const { find } = await importPkg('lodash-es')
  const spinner = print.bora('Rebuilding \'%s\'...', schema.name).start()
  const instance = find(this.bajoDb.instances, { name: schema.connection })
  if (!instance) spinner.fatal('No database connection \'%s\' for \'%s\'. Aborted!', schema.connection, schema.name)
  if (instance.memory) {
    spinner.warn('Db \'%s\' for \'%s\' is a memory database, skipped', instance.name, schema.name)
    return null
  }
  return await modeler[instance.driver].call(this, { schema, instance, spinner })
}

export default rebuildModel
