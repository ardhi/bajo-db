async function exit () {
  const { log } = this.bajo.helper
  if (this.bajoDb.instances.length === 0) return
  for (const i of this.bajoDb.instances) {
    await i.client.destroy()
    log.debug('\'%s\' is destroyed', i.name)
  }
}

export default exit
