import buildRecordAction from '../../../lib/build-record-action.js'

async function count (name, filter, options = {}) {
  const { collExists } = this.bajoDb.helper
  const { dataOnly = true } = options
  await collExists(name, true)
  const { handler, schema } = await buildRecordAction.call(this, name, 'count')
  const rec = await handler.call(this, { schema, filter, options })
  return dataOnly ? rec.data : rec
}

export default count
