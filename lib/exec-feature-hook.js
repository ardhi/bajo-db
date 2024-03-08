async function execFeatureHook (name, { schema, body } = {}) {
  const { importPkg } = this.bajo.helper
  const { get } = await importPkg('lodash-es')
  for (const f of schema.feature) {
    const fn = get(this.bajoDb.feature, f.name)
    if (!fn) continue
    const input = await fn.call(this, f)
    const hook = get(input, 'hook.' + name)
    if (hook) await hook.call(this, { schema, body })
  }
}

export default execFeatureHook
