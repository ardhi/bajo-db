import path from 'path'

async function collectSchema ({ file, alias, plugin }) {
  const { importPkg, readConfig, fatal, pascalCase, eachPlugins } = this.bajo.helper
  const { isPlainObject, each, find, has, isArray, reduce, forOwn } = await importPkg('lodash-es')
  const defName = pascalCase(`${alias} ${path.basename(file, path.extname(file))}`)
  const mod = await readConfig(file, { ignoreError: true })
  if (!isPlainObject(mod)) fatal('Invalid schema \'%s\'', defName)
  mod.name = mod.name ?? defName
  mod.repoName = mod.repoName ?? mod.name
  if (!mod.connection) mod.connection = 'default'
  mod.file = file
  mod.plugin = plugin
  mod.feature = mod.feature ?? {}
  if (isArray(mod.feature)) mod.feature = reduce(mod.feature, (obj = {}, i) => { obj[i] = true; return obj }, {})
  if ((mod.properties ?? []).length === 0) fatal('Schema \'%s\' doesn\'t have properties at all', mod.name)
  // schema extender
  await eachPlugins(async function (ext) {
    const extender = await readConfig(ext.file, { ignoreError: true })
    if (!isPlainObject(extender)) return undefined
    each(extender.properties ?? [], p => {
      if (find(mod.properties, { name: p.name })) return undefined
      mod.properties.push(p)
    })
    if (isArray(extender.feature)) extender.feature = reduce(extender.feature, (obj = {}, i) => { obj[i] = true; return obj }, {})
    forOwn(extender.feature, (v, k) => {
      if (!has(mod.feature, k)) mod.feature[k] = v
    })
    if (ext.plugin === 'app') {
      each(['connection', 'repoName'], i => {
        if (has(extender, i)) mod[i] = extender[i]
      })
    }
    mod.extender = mod.extender ?? []
    mod.extender.push(ext.plugin)
  }, { glob: `schema/extend/${mod.plugin}/${path.basename(mod.file, path.extname(mod.file))}.*` })
  return mod
}

export default collectSchema
