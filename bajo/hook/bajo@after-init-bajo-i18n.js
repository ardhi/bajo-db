async function afterInitBajoI18N () {
  const config = this.app.bajoI18N.config
  if (!config.fallbackNS.includes(this.name)) config.fallbackNS.push(this.name)
}

export default afterInitBajoI18N
