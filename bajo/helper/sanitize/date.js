function sanitizeDate (value, { input, output, silent = true } = {}) {
  const { dayjs } = this.bajo.helper
  if (value === 0) return null
  if (!output) output = input
  const dt = dayjs(value, input)
  if (!dt.isValid()) {
    if (silent) return -1
    throw new Error('Invalid date')
  }
  if (output === 'native' || !output) return dt.toDate()
  return dt.format(output)
}

export default sanitizeDate
