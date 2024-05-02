function validationErrorMessage (err) {
  const { join } = this.bajo.helper
  let text = err.message
  if (err.details) {
    text += ' -> '
    text += join(err.details.map((d, idx) => {
      return `${d.field}@${err.collection}: ${d.error} (${d.value})`
    }))
  }
  return text
}

export default validationErrorMessage
