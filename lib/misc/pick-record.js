async function pickRecord (record, fields) {
  const { importPkg } = this.bajo.helper
  const { isArray, pick, clone, isEmpty } = await importPkg('lodash-es')
  if (isEmpty(record)) return record
  if (!isArray(fields)) return record
  const fl = clone(fields)
  if (!fl.includes('id')) fl.unshift('id')
  return pick(record, fl)
}

export default pickRecord
