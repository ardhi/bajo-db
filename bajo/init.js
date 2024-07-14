import collectConnections from '../lib/collect-connections.js'
import collectDrivers from '../lib/collect-drivers.js'
import collectFeature from '../lib/collect-feature.js'
import collectSchema from '../lib/collect-schema.js'
import sanitizeSchema from '../lib/sanitize-schema.js'

async function init () {
  const { buildCollections, eachPlugins, join } = this.app.bajo
  const { fs } = this.app.bajo.lib
  const { isEmpty, map } = this.app.bajo.lib._
  const cfg = this.config
  fs.ensureDirSync(`${cfg.dir.data}/attachment`)
  await collectDrivers.call(this)
  this.connections = await buildCollections({ ns: this.name, handler: collectConnections, dupChecks: ['name'] })
  if (this.connections.length === 0) this.log.warn('No %s found!', this.print.write('connection'))
  this.log.debug('Loaded connections: %s', join(map(this.connections, 'name')))
  this.feature = {}
  await eachPlugins(collectFeature, { glob: 'feature/*.js' })
  this.log.debug('Loaded features: %s', join(Object.keys(this.feature)))
  this.schemas = []
  const result = await eachPlugins(collectSchema, { glob: 'schema/*.*' })
  if (isEmpty(result)) this.log.warn('No %s found!', this.print.write('schema'))
  else await sanitizeSchema.call(this, result)
}

export default init
