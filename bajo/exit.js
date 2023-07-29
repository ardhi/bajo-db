async function exit () {
  const { log, importPkg } = this.bajo.helper
  const fs = await importPkg('fs-extra')
  // this.bajoDb.instance.close()
  fs.remove(this.bajoDb.socket)
  log.trace('Instance terminated')
}

export default exit
