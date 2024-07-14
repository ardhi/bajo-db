async function beforeResourceMerge (lng, content) {
  const { eachPlugins, readConfig } = this.app.bajo
  const { merge } = this.app.bajo.lib._
  await eachPlugins(async function ({ file }) {
    const item = await readConfig(file)
    merge(content, item)
  }, { glob: `i18n/${lng}.json`, ns: 'bajoDb' })
}

export default beforeResourceMerge
