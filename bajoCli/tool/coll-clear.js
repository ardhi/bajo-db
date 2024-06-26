import postProcess from './lib/post-process.js'

async function collClear ({ path, args, options }) {
  const { print, getConfig } = this.bajo.helper
  const { isEmpty, get } = this.bajo.helper._
  const config = getConfig()
  const schemas = get(this, 'bajoDb.schemas', [])
  if (isEmpty(schemas)) return print.fail('No schema found!', { exit: config.tool })
  const [schema] = args
  await postProcess.call(this, { handler: 'collClear', params: [schema], path, processMsg: 'Clear records', options })
}

export default collClear
