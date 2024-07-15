import postProcess from './lib/post-process.js'

async function collClear ({ path, args, options }) {
  const { print } = this.app.bajo
  const { isEmpty, get } = this.app.bajo.lib._
  const schemas = get(this, 'bajoDb.schemas', [])
  if (isEmpty(schemas)) return print.fail('No schema found!', { exit: this.app.bajo.toolMode })
  const [schema] = args
  await postProcess.call(this, { handler: 'collClear', params: [schema], path, processMsg: 'Clear records', options })
}

export default collClear
