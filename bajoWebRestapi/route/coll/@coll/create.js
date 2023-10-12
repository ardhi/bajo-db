const create = {
  handler: async function (ctx, req, reply) {
    const { recordCreate } = this.bajoWeb.helper
    return await recordCreate({ req, reply })
  },
  schema: async function (ctx, parentCtx) {
    const { docSchemaParams } = this.bajoWebRestapi.helper
    await docSchemaParams(parentCtx, 'paramsColl', 'coll||Collection ID')
    return {
      params: { $ref: 'paramsColl#' },
      querystring: { $ref: 'qsFields#' }
    }
  }
}

export default create
