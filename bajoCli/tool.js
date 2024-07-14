async function tool ({ path, args = [] }) {
  const { currentLoc } = this.app.bajo
  const { runToolMethod } = this.bajoCli.helper
  const options = { demonize: ['shell'] }
  await runToolMethod({ path, args, dir: `${currentLoc(import.meta).dir}/tool`, options })
}

export default tool
