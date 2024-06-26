import path from 'path'

async function collectFeature ({ file, alias, plugin }) {
  const { importModule, log, fatal } = this.bajo.helper
  const { camelCase, isFunction } = this.bajo.helper._
  const name = camelCase((plugin === 'bajoDb' ? '' : plugin) + ' ' + path.basename(file, '.js'))
  const mod = await importModule(file)
  if (!isFunction(mod)) fatal('Feature \'%s\' should be an async function', name)
  this.bajoDb.feature = this.bajoDb.feature ?? {}
  this.bajoDb.feature[name] = mod
  log.trace('Load feature: %s', name)
}

export default collectFeature
