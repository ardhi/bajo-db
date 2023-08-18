import path from 'path'

async function collectFeature ({ file, alias, plugin }) {
  const { importPkg, importModule, log } = this.bajo.helper
  const { camelCase, isFunction } = await importPkg('lodash-es')
  const name = camelCase((plugin === 'bajoDb' ? '' : plugin) + ' ' + path.basename(file, '.js'))
  const mod = await importModule(file)
  this.bajoDb.feature = this.bajoDb.feature ?? {}
  this.bajoDb.feature[name] = isFunction(mod) ? (await mod.call(this)) : mod
  log.trace('Adding feature: %s', name)
}

export default collectFeature
