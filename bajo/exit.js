async function exit () {
  const { log, fs } = this.bajo.helper
  // this.bajoDb.instance.close()
  await fs.remove(this.bajoDb.socket)
  log.trace('Instance terminated')
}

export default exit
