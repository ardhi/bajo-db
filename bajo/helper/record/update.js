import buildRecordAction from '../../../lib/build-record-action.js'
import checkUnique from '../../../lib/check-unique.js'
import handleAttachmentUpload from '../../../lib/handle-attachment-upload.js'
import execValidation from '../../../lib/exec-validation.js'
import execFeatureHook from '../../../lib/exec-feature-hook.js'

async function update (name, id, input, options = {}) {
  const { runHook, importPkg, print } = this.bajo.helper
  const { pickRecord, sanitizeBody, collExists, sanitizeId } = this.bajoDb.helper
  const { clearColl } = this.bajoDb.cache ?? {}
  const { get, forOwn } = await importPkg('lodash-es')
  options.dataOnly = options.dataOnly ?? true
  const { fields, dataOnly, skipHook, skipValidation, ignoreHidden, partial = true } = options
  await collExists(name, true)
  const { handler, schema } = await buildRecordAction.call(this, name, 'update')
  id = sanitizeId(id, schema)
  let body = await sanitizeBody({ body: input, schema, partial, strict: true })
  delete body.id
  if (!skipValidation) body = await execValidation.call(this, { skipHook, name, body, options, partial })
  if (!skipHook) {
    await runHook('bajoDb:onBeforeRecordUpdate', name, id, body, options)
    await runHook(`bajoDb.${name}:onBeforeRecordUpdate`, id, body, options)
  }
  await execFeatureHook.call(this, 'beforeUpdate', { schema, body })
  await checkUnique.call(this, { schema, body, id })
  let record
  const nbody = {}
  forOwn(body, (v, k) => {
    if (v !== undefined) nbody[k] = v
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
  await execFeatureHook.call(this, 'afterUpdate', { schema, body: nbody, record })
  if (!skipHook) {
    await runHook(`bajoDb.${name}:onAfterRecordUpdate`, id, nbody, options, record)
    await runHook('bajoDb:onAfterRecordUpdate', name, id, nbody, options, record)
  }
  if (clearColl) await clearColl({ coll: name, id, body: nbody, options, record })
  record.oldData = await pickRecord({ record: record.oldData, fields, schema, ignoreHidden })
  record.data = await pickRecord({ record: record.data, fields, schema, ignoreHidden })
  return dataOnly ? record.data : record
}

export default update
