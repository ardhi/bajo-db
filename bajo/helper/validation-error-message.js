function validationErrorMessage (err) {
  let text = err.message
  if (err.details) {
    text += ' -> '
    text += err.details.map((d, idx) => {
      return `${d.field}: ${d.error} (${d.value})`
    }).join(', ')
  }
  return text
}

export default validationErrorMessage
