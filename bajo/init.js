import connection from '../lib/prep/connection.js'

export default async function () {
  const { getPluginName } = this.bajo.helper
  await connection.call(this)
}
