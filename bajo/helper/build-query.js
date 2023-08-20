import nql from '@tryghost/nql'

async function buildQuery (input) {
  const { importPkg } = this.bajo.helper
  const { trim, isString, isEmpty, isPlainObject } = await importPkg('lodash-es')
  if (isEmpty(input)) return
  if (isPlainObject(input)) return input
  if (!isString(input)) return
  if (trim(input).startsWith('{')) return JSON.parse(input)
  return nql(input).parse()
}

export default buildQuery
