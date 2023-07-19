async function schemaSanitizer (items) {
  const { importPkg, freeze, log } = this.bajo.helper
  const { forOwn, map, keys } = await importPkg('lodash-es')
  this.bajoDb.schemas = this.bajoDb.schemas || []
  forOwn(items, (v, k) => {
    log.trace('Load schema: %s (%d)', k, keys(v).length)
    forOwn(v, (item, file) => {
      item.file = file
      this.bajoDb.schemas.push(item)
    })
  })
  freeze(this.bajoDb.schemas)
  log.debug('Loaded schemas: %s', map(this.bajoDb.schemas, 'name').join(', '))
}

export default schemaSanitizer
