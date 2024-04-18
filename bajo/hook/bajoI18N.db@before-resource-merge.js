async function beforeResourceMerge (lng, content) {
  const { eachPlugins, readConfig } = this.bajo.helper
  const { merge } = this.bajo.helper._
  await eachPlugins(async function ({ file }) {
    const item = await readConfig(file)
    merge(content, item)
  }, { glob: `i18n/${lng}.json`, ns: 'bajoDb' })
}

export default beforeResourceMerge
