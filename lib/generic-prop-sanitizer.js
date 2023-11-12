async function generic ({ prop, schema, driver }) {
  const { importPkg, getConfig, fatal } = this.bajo.helper
  const { propType } = this.bajoDb.helper
  const { has, get, each } = await importPkg('lodash-es')
  const opts = getConfig('bajoDb')
  const def = propType[prop.type]
  if (prop.name === 'id' && ['smallint', 'integer'].includes(prop.type) && driver.driver !== 'knex') {
    fatal('Integer types of ID only supported by knex driver')
  }
  // if (prop.unique) prop.required = true
  if (prop.type === 'string') {
    def.minLength = prop.minLength ?? 0
    def.maxLength = prop.maxLength ?? 255
    if (has(prop, 'length')) def.maxLength = prop.length
    if (prop.required && def.minLength === 0) def.minLength = 1
    if (def.minLength > 0) prop.required = true
  }
  if (prop.autoInc && !['smallint', 'integer'].includes(prop.type)) delete prop.autoInc
  each(['minLength', 'maxLength', 'kind'], p => {
    if (!has(def, p)) {
      delete prop[p]
      return undefined
    }
    prop[p] = get(prop, p, get(opts, `defaults.property.${prop.type}.${p}`, def[p]))
    if (def.choices && !def.choices.includes(prop[p])) {
      fatal('Unsupported %s \'%s\' for \'%s@%s\'. Allowed choices: %s',
        p, prop[p], prop.name, schema.name, def.choices.join(', '))
    }
  })
}

export default generic
