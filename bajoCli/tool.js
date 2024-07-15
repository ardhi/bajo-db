async function tool ({ path, args = [] }) {
  const { currentLoc } = this.app.bajo
  const options = { demonize: ['shell'] }
  await this.bajoCli.runToolMethod({ path, args, dir: `${currentLoc(import.meta).dir}/tool`, options })
}

export default tool
