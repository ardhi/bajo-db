const indexTypes = ['default', 'unique', 'primary', 'fulltext']

async function genericPropSanitizer ({ prop, schema, driver }) {
  const { getConfig, fatal, join } = this.bajo.helper
  const { propType } = this.bajoDb.helper
  const { has, get, each } = this.bajo.helper._
  const opts = getConfig('bajoDb')
  const def = propType[prop.type]
  // detect from drivers
  /*
  if (prop.name === 'id' && ['smallint', 'integer'].includes(prop.type) && driver.driver !== 'knex') {
    fatal('Integer types of ID only supported by knex driver')
  }
  */
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
        p, prop[p], prop.name, schema.name, join(def.choices))
    }
  })
  if (prop.index && !indexTypes.includes(prop.index.type)) {
    fatal('Unsupported index type %s for \'%s@%s\'. Allowed choices: %s',
      prop.index.type, prop.name, schema.name, join(indexTypes))
  }
}

export default genericPropSanitizer
