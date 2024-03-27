async function checkUnique ({ schema, body, id }) {
  const { importPkg, error, isSet } = this.bajo.helper
  const { recordFind, recordGet } = this.bajoDb.helper
  const { filter, map, set } = await importPkg('lodash-es')
  const singles = map(filter(schema.properties, p => (p.index ?? {}).type === 'unique'), 'name')
  const opts = { skipHook: true, skipCache: true, thrownNotFound: false }
  let old = {}
  if (id) old = (await recordGet(schema.name, id, opts)) ?? {}
  for (const s of singles) {
    if (!isSet(body[s])) continue
    if (id && body[s] === old[s]) continue
    const query = set({}, s, body[s])
    const resp = await recordFind(schema.name, { query, limit: 1 }, opts)
    if (resp.length !== 0) {
      const details = [{ field: s, error: 'Unique constraint error' }]
      throw error('Unique constraint error', { details })
    }
  }
  const multis = filter(schema.indexes, i => i.type === 'unique')
  for (const m of multis) {
    const query = {}
    let empty = true
    let same = true
    for (const f of m.fields) {
      if (body[f]) empty = false
      if (body[f] !== old[f]) same = false
      query[f] = body[f]
    }
    if (empty || same) continue
    const resp = await recordFind(schema.name, { query, limit: 1 }, { skipHook: true, skipCache: true })
    if (resp.length !== 0) {
      const details = map(m.fields, f => {
        return { field: f, error: 'Unique constraint error' }
      })
      throw error('Unique constraint error', { details })
    }
  }
}

export default checkUnique
