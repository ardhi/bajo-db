const updatedAt = {
  addProps: async function (opts) {
    if (opts === true) opts = { fieldName: 'updatedAt' }
    return {
      name: opts.fieldName ?? 'updatedAt',
      type: 'datetime',
      index: true
    }
  },
  hook: {
    beforeCreate: async function ({ schema, body }) {
      const { isSet, importPkg } = this.bajo.helper
      const { get } = await importPkg('lodash-es')
      const now = new Date()
      const overwrite = get(schema, 'feature.updatedAt.overwrite')
      const field = get(schema, 'feature.updatedAt.fieldName', 'updatedAt')
      if (overwrite || !isSet(body[field])) body[field] = now
    },
    beforeUpdate: async function ({ schema, body }) {
      const { isSet, importPkg } = this.bajo.helper
      const { get } = await importPkg('lodash-es')
      const now = new Date()
      const overwrite = get(schema, 'feature.updatedAt.overwrite')
      const field = get(schema, 'feature.updatedAt.fieldName', 'updatedAt')
      if (overwrite || !isSet(body[field])) body[field] = now
    }
  }
}

export default updatedAt
