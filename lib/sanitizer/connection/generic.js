async function generic (item) {
  const { importPkg } = this.bajo.helper
  const { omit } = await importPkg('lodash-es')
  return {
    name: item.name,
    client: item.type,
    connection: omit(item, ['name', 'client'])
  }
}

export default generic
