import startKnex from '../lib/knex/start.js'
import startMingo from '../lib/mingo/start.js'

const starter = {
  knex: startKnex,
  mingo: startMingo
}

async function start (noRebuild) {
  this.bajoDb.instances = []
  for (const opts of (this.bajoDb.connections || [])) {
    await starter[opts.driver].call(this, opts, noRebuild)
  }
}

export default start
