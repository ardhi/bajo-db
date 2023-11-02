function validationErrorMessage (err) {
  let text = err.message
  if (err.details) text += ' -> ' + err.details.map(d => `${d.field}: ${d.error}`).join(', ')
  return text
}

export default validationErrorMessage
