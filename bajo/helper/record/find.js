import buildRecordAction from '../../../lib/build-record-action.js'

async function handleBboxQuery (filter, schema, options = {}) {
  const { importPkg } = this.bajo.helper
  const { merge } = await importPkg('lodash-es')
  const props = schema.properties.map(item => item.name)
  const { bboxLatField = 'lat', bboxLngField = 'lng' } = options
  if (filter.bbox && props.includes(bboxLatField) && props.includes(bboxLngField)) {
    const [minx, miny, maxx, maxy] = filter.bbox
    const q = {}
    q[bboxLngField] = { $gte: minx, $lte: maxx }
    q[bboxLatField] = { $gte: miny, $lte: maxy }
    if (filter.query) {
      const $or = filter.query.$or
      if ($or) filter.query = merge(q, { $or })
      else merge(filter.query, q)
    } else filter.query = q
    delete filter.bbox
  }
}

async function find (name, filter = {}, options = {}) {
  const { runHook } = this.bajo.helper
  const { pickRecord, collExists } = this.bajoDb.helper
  options.dataOnly = options.dataOnly ?? true
  const { fields, dataOnly, skipHook, ignoreHidden } = options
  await collExists(name, true)
  const { handler, schema } = await buildRecordAction.call(this, name, 'find')
  if (!skipHook) {
    await runHook('bajoDb:onBeforeRecordFind', name, filter, options)
    await runHook(`bajoDb.${name}:onBeforeRecordFind`, filter, options)
  }
  await handleBboxQuery.call(this, filter, schema, options)
  const records = await handler.call(this, { schema, filter, options })
  if (!skipHook) {
    await runHook(`bajoDb.${name}:onAfterRecordFind`, filter, options, records)
    await runHook('bajoDb:onAfterRecordFind', name, filter, options, records)
  }
  for (const idx in records.data) {
    records.data[idx] = await pickRecord({ record: records.data[idx], fields, schema, ignoreHidden })
  }
  return dataOnly ? records.data : records
}

export default find
