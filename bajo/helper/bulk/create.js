import buildBulkAction from '../../../lib/build-bulk-action.js'
import execValidation from '../../../lib/exec-validation.js'
import execFeatureHook from '../../../lib/exec-feature-hook.js'

async function create (name, inputs, options) {
  const { generateId, runHook, importPkg, isSet } = this.bajo.helper
  const { sanitizeBody, collExists } = this.bajoDb.helper
  const { clearColl } = this.bajoDb.cache ?? {}
  const { find } = await importPkg('lodash-es')
  options.dataOnly = options.dataOnly ?? true
  options.truncateString = options.truncateString ?? true
  const { skipHook, skipValidation } = options
  await collExists(name, true)
  const { handler, schema } = await buildBulkAction.call(this, name, 'create', options)
  const idField = find(schema.properties, { name: 'id' })
  const bodies = [...inputs]
  for (let b of bodies) {
    b.id = b.id ?? generateId(idField.type === 'integer' ? 'int' : undefined)
    b = await sanitizeBody({ body: b, schema, strict: true })
    if (!skipValidation) b = await execValidation.call(this, { skipHook, name, b, options })
  }
  if (!skipHook) {
    await runHook('bajoDb:onBeforeBulkCreate', name, bodies, options)
    await runHook(`bajoDb.${name}:onBeforeBulkCreate`, bodies, options)
  }
  for (const idx in bodies) {
    await execFeatureHook.call(this, 'beforeCreate', { schema, body: bodies[idx] })
    // TODO: check unique?
    for (const k in bodies[idx]) {
      if (bodies[idx][k] === undefined) continue
      const prop = find(schema.properties, { name: k })
      if (options.truncateString && isSet(bodies[idx][k]) && prop && ['string', 'text'].includes(prop.type)) bodies[idx][k] = bodies[idx][k].slice(0, prop.maxLength)
    }
  }
  await handler.call(this, { schema, bodies, options })
  for (const idx in bodies) {
    await execFeatureHook.call(this, 'afterCreate', { schema, body: bodies[idx] })
  }
  if (!skipHook) {
    await runHook(`bajoDb.${name}:onAfterBulkCreate`, bodies, options)
    await runHook('bajoDb:onAfterBulkCreate', name, bodies, options)
  }
  if (clearColl) await clearColl({ coll: name })
}

export default create
