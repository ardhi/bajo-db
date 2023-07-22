import path from 'path'

async function collectSchema ({ file, alias, plugin }) {
  const { importPkg, readConfig, fatal, pascalCase } = this.bajo.helper
  const { isFunction, isPlainObject } = await importPkg('lodash-es')
  const defName = pascalCase(`${alias} ${path.basename(file, path.extname(file))}`)
  let mod = await readConfig(file, { ignoreError: true })
  if (isFunction(mod)) mod = await mod.call(this)
  if (!isPlainObject(mod)) fatal('Invalid schema \'%s\'', defName)
  mod.name = mod.name || defName
  mod.collName = mod.collName || mod.name
  if (!mod.connection) mod.connection = 'default'
  mod.plugin = plugin
  if ((mod.properties || []).length === 0) fatal('Schema \'%s\' doesn\'t have properties at all', mod.name)
  return mod
}

export default collectSchema
