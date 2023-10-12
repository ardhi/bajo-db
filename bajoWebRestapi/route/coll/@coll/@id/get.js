const get = {
  handler: async function (ctx, req, reply) {
    const { recordGet } = this.bajoWeb.helper
    return await recordGet({ req, reply })
  },
  schema: async function (ctx, parentCtx) {
    const { docSchemaParams } = this.bajoWebRestapi.helper
    await docSchemaParams(parentCtx, 'paramsCollId', 'coll||Collection ID', 'id||Record ID')
    return {
      params: { $ref: 'paramsCollId#' },
      querystring: { $ref: 'qsFields#' }
    }
  }
}

export default get
