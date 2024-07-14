async function findAll (name, filter = {}, options = {}) {
  const { recordFind } = this.bajoDb.helper
  filter.page = 1
  filter.limit = 100
  options.dataOnly = true
  const all = []
  for (;;) {
    const results = await recordFind(name, filter, options)
    if (results.length === 0) break
    all.push(...results)
    filter.page++
  }
  return all
}

export default findAll
