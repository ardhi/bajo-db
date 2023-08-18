const createdAt = {
  addProps: async function (opts) {
    if (opts === true) opts = { fieldName: 'createdAt' }
    return {
      name: opts.fieldName ?? 'createdAt',
      type: 'datetime',
      index: true
    }
  },
  hook: {
    beforeCreate: async function ({ schema, body }) {
      const { isSet, importPkg } = this.bajo.helper
      const { get } = await importPkg('lodash-es')
      const now = new Date()
      const overwrite = get(schema, 'feature.createdAt.overwrite')
      const field = get(schema, 'feature.createdAt.fieldName', 'createdAt')
      if (overwrite || !isSet(body[field])) body[field] = now
    }
  }
}

export default createdAt
