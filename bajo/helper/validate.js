import joi from 'joi'

const excludedTypes = ['object']

async function buildFromDbSchema (repo, { fields = [] } = {}) {
  const { getInfo } = this.bajoDb.helper
  const { schema } = await getInfo(repo)
  const obj = {}
  for (const p of schema.properties) {
    if (excludedTypes.includes(p.type)) continue
    if (fields.length > 0 && !fields.includes(p.name)) continue
    let item
    switch (p.type) {
      case 'string':
        item = joi.string().min(p.minLength).max(p.maxLength)
        if (p.required || p.minLength > 0) item.required()
    }
    if (item) obj[p.name] = item
  }
  return joi.object(obj)
}

async function validate (joiSchema, value, { ns, fields } = {}) {
  const { error, importPkg } = this.bajo.helper
  const { map } = await importPkg('lodash-es')
  const { isString } = await importPkg('lodash-es')
  if (isString(joiSchema)) joiSchema = await buildFromDbSchema.call(this, joiSchema, { fields })
  try {
    return await joiSchema.validateAsync(value)
  } catch (err) {
    const details = map(err.details ?? [], d => {
      return {
        field: d.context.key,
        error: d.message.replaceAll(`"${d.context.key}"`, '%s')
      }
    })
    throw error('Validation Error', { details, ns })
  }
}

export default validate
