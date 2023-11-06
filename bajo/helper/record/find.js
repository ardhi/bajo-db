import buildRecordAction from '../../../lib/build-record-action.js'

async function handleBboxQuery (filter, schema) {
  const { importPkg } = this.bajo.helper
  const { merge } = await importPkg('lodash-es')
  const props = schema.properties.map(item => item.name)
  if (filter.bbox && props.includes('lat') && props.includes('lng')) {
    const [minx, miny, maxx, maxy] = filter.bbox
    const lng = { $gte: minx, $lte: maxx }
    const lat = { $gte: miny, $lte: maxy }
    if (filter.query) {
      const $or = filter.query.$or
      if ($or) {
        filter.query = { lat, lng, $or }
      } else merge(filter.query, { lng, lat })
    } else filter.query = { lng, lat }
    delete filter.bbox
  }
}

async function find (name, filter = {}, options = {}) {
  const { runHook } = this.bajo.helper
  const { pickRecord, collExists } = this.bajoDb.helper
  const { fields, dataOnly = true, skipHook, ignoreHidden } = options
  await collExists(name, true)
  const { handler, schema } = await buildRecordAction.call(this, name, 'find')
  if (!skipHook) {
    await runHook('bajoDb:onBeforeRecordFind', name, filter, options)
    await runHook(`bajoDb.${name}:onBeforeRecordFind`, filter, options)
  }
  await handleBboxQuery.call(this, filter, schema)
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
