import path from 'path'

async function collectFeature ({ file, alias, ns }) {
  const { importModule, fatal } = this.app.bajo
  const { camelCase, isFunction } = this.app.bajo.lib._
  let name = camelCase(path.basename(file, '.js'))
  if (ns !== this.name) name = `${ns}:${name}`
  const mod = await importModule(file)
  if (!isFunction(mod)) fatal('Feature \'%s\' should be an async function', name)
  this.feature = this.feature ?? {}
  this.feature[name] = mod
  this.log.trace('Load feature: %s', name)
}

export default collectFeature
