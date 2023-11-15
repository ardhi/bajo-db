import nql from '@tryghost/nql'

async function handleBbox ({ bbox, query, schema, options = {} } = {}) {
  const { importPkg } = this.bajo.helper
  const { merge, isEmpty } = await importPkg('lodash-es')
  const props = schema.properties.map(item => item.name)
  const { bboxLatField = 'lat', bboxLngField = 'lng' } = options
  if (props.includes(bboxLatField) && props.includes(bboxLngField)) {
    const [minx, miny, maxx, maxy] = bbox
    const q = {}
    q[bboxLngField] = { $gte: minx, $lte: maxx }
    q[bboxLatField] = { $gte: miny, $lte: maxy }
    if (isEmpty(query)) query = q
    else {
      const $or = query.$or
      if ($or) query = merge(q, { $or })
      else merge(query, q)
    }
  }
}

async function buildQuery ({ filter, schema, options = {} } = {}) {
  const { importPkg } = this.bajo.helper
  const { parseBbox } = this.bajoDb.helper
  const { trim, isString } = await importPkg('lodash-es')
  let query = {}
  if (isString(filter.query)) {
    if (trim(filter.query).startsWith('{')) query = JSON.parse(filter.query)
    else query = nql(filter.query).parse()
  }
  const bbox = parseBbox(filter.bbox)
  if (!bbox) return query
  await handleBbox.call(this, { bbox, query, schema, options })
  return query
}

export default buildQuery
