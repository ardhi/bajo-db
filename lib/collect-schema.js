import path from 'path'

async function collectSchema ({ file, alias, plugin }) {
  const { importPkg, readConfig, fatal, pascalCase, eachPlugins } = this.bajo.helper
  const { isPlainObject, each, find, has, isArray, forOwn, isString, merge } = await importPkg('lodash-es')
  const defName = pascalCase(`${alias} ${path.basename(file, path.extname(file))}`)
  const mod = await readConfig(file, { ignoreError: true })
  if (!isPlainObject(mod)) fatal('Invalid schema \'%s\'', defName)
  mod.name = mod.name ?? defName
  mod.collName = mod.collName ?? mod.name
  if (!mod.connection) mod.connection = 'default'
  mod.file = file
  mod.plugin = plugin
  mod.feature = mod.feature ?? []
  mod.hidden = mod.hidden ?? []
  const feats = []
  if (isArray(mod.feature)) {
    each(mod.feature, f => {
      if (isString(f)) feats.push({ name: f })
      else if (isPlainObject(f)) feats.push(f)
    })
  } else if (isPlainObject(mod.feature)) {
    forOwn(mod.feature, (v, k) => {
      feats.push(merge({}, v, { name: k }))
    })
  }
  mod.feature = feats
  if ((mod.properties ?? []).length === 0) fatal('Schema \'%s\' doesn\'t have properties at all', mod.name)
  // schema extender
  await eachPlugins(async function (ext) {
    const extender = await readConfig(ext.file, { ignoreError: true })
    extender.hidden = extender.hidden ?? []
    if (!isPlainObject(extender)) return undefined
    each(extender.properties ?? [], p => {
      if (isString(p) && mod.properties.includes(p)) return undefined
      else if (find(mod.properties, { name: p.name })) return undefined
      mod.properties.push(p)
    })
    const feats = []
    if (isArray(extender.feature)) {
      each(extender.feature, f => {
        if (isString(f)) feats.push({ name: f })
        else if (isPlainObject(f)) feats.push(f)
      })
    } else if (isPlainObject(extender.feature)) {
      forOwn(extender.feature, (v, k) => {
        feats.push(merge({}, v, { name: k }))
      })
    }
    if (extender.hidden.length > 0) mod.hidden.push(...extender.hidden)
    if (feats.length > 0) mod.feature.push(...feats)
    if (ext.plugin === 'app') {
      each(['connection', 'collName'], i => {
        if (has(extender, i)) mod[i] = extender[i]
      })
    }
    mod.extender = mod.extender ?? []
    mod.extender.push(ext.plugin)
  }, { glob: `schema/extend/${mod.plugin}/${path.basename(mod.file, path.extname(mod.file))}.*` })
  return mod
}

export default collectSchema
