const create = {
  handler: async function (ctx, req, reply) {
    const { recordCreate } = this.bajoWeb.helper
    return await recordCreate({ req, reply })
  },
  schema: async function (ctx, parentCtx) {
    const { docSchemaParams } = this.bajoWebRestapi.helper
    await docSchemaParams(parentCtx, 'paramsRepo', 'repo||Repository ID')
    return {
      params: { $ref: 'paramsRepo#' },
      querystring: { $ref: 'qsFields#' }
    }
  }
}

export default create
