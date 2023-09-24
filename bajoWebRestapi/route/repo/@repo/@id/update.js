const update = {
  handler: async function (ctx, req, reply) {
    const { recordUpdate } = this.bajoWeb.helper
    return await recordUpdate({ req, reply })
  },
  schema: async function (ctx, parentCtx) {
    const { docSchemaParams } = this.bajoWebRestapi.helper
    await docSchemaParams(parentCtx, 'paramsRepoId', 'repo||Repository ID', 'id||Record ID')
    return {
      params: { $ref: 'paramsRepoId#' },
      querystring: { $ref: 'qsFields#' }
    }
  }
}

export default update
