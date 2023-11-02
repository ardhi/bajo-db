import path from 'path'

async function collectFeature ({ file, alias, plugin }) {
  const { importPkg, importModule, log, fatal } = this.bajo.helper
  const { camelCase, isFunction } = await importPkg('lodash-es')
  const name = camelCase((plugin === 'bajoDb' ? '' : plugin) + ' ' + path.basename(file, '.js'))
  const mod = await importModule(file)
  if (!isFunction(mod)) fatal('Feature \'%s\' should be an async function', name)
  this.bajoDb.feature = this.bajoDb.feature ?? {}
  this.bajoDb.feature[name] = mod
  log.trace('Adding feature: %s', name)
}

export default collectFeature
