import resolveMethod from '../../../lib/resolve-method.js'
import checkUnique from '../../../lib/check-unique.js'
import handleAttachmentUpload from '../../../lib/handle-attachment-upload.js'
import execValidation from '../../../lib/exec-validation.js'
import execFeatureHook from '../../../lib/exec-feature-hook.js'

async function update (name, id, input, opts = {}) {
  const { runHook, print, isSet } = this.bajo.helper
  const { pickRecord, sanitizeBody, collExists, sanitizeId } = this.bajoDb.helper
  const { clearColl } = this.bajoDb.cache ?? {}
  const { get, forOwn, find, cloneDeep } = this.bajo.helper._
  const options = cloneDeep(opts)
  options.dataOnly = options.dataOnly ?? true
  input = cloneDeep(input)
  const { fields, dataOnly, noHook, noValidation, noCheckUnique, noFeatureHook, noResult, noSanitize, partial = true, hidden } = options
  options.dataOnly = true
  options.truncateString = options.truncateString ?? true
  await collExists(name, true)
  const { handler, schema } = await resolveMethod.call(this, name, 'record-update')
  id = sanitizeId(id, schema)
  let body = noSanitize ? input : await sanitizeBody({ body: input, schema, partial, strict: true })
  delete body.id
  if (!noHook) {
    await runHook('bajoDb:onBeforeRecordUpdate', name, id, body, options)
    await runHook(`bajoDb.${name}:onBeforeRecordUpdate`, id, body, options)
  }
  if (!noFeatureHook) await execFeatureHook.call(this, 'beforeUpdate', { schema, body })
  if (!noValidation) body = await execValidation.call(this, { noHook, name, body, options, partial })
  if (!noCheckUnique) await checkUnique.call(this, { schema, body, id })
  let record
  const nbody = {}
  forOwn(body, (v, k) => {
    if (v === undefined) return undefined
    const prop = find(schema.properties, { name: k })
    if (options.truncateString && isSet(v) && prop && ['string', 'text'].includes(prop.type)) v = v.slice(0, prop.maxLength)
    nbody[k] = v
  })
  delete nbody.id
  try {
    record = await handler.call(this, { schema, id, body: nbody, options })
    if (options.req) {
      if (options.req.file) await handleAttachmentUpload.call(this, { name: schema.name, id, body, options, action: 'update' })
      if (options.req.flash) options.req.flash('dbsuccess', { message: print.__('Record successfully updated', { ns: 'bajoDb' }), record })
    }
  } catch (err) {
    if (get(options, 'req.flash')) options.req.flash('dberr', err)
    throw err
  }
  if (!noFeatureHook) await execFeatureHook.call(this, 'afterUpdate', { schema, body: nbody, record })
  if (!noHook) {
    await runHook(`bajoDb.${name}:onAfterRecordUpdate`, id, nbody, options, record)
    await runHook('bajoDb:onAfterRecordUpdate', name, id, nbody, options, record)
  }
  if (clearColl) await clearColl({ coll: name, id, body: nbody, options, record })
  if (noResult) return
  record.oldData = await pickRecord({ record: record.oldData, fields, schema, hidden })
  record.data = await pickRecord({ record: record.data, fields, schema, hidden })
  return dataOnly ? record.data : record
}

export default update
