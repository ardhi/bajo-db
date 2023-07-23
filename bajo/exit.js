async function exit () {
  const { log } = this.bajo.helper
  this.bajoDb.instance.close()
  log.trace('Instance terminated')
}

export default exit
