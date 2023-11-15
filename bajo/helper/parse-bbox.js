async function getCountryBbox (item) {
  item = item + ''
  if (item.includes(',')) return
  if (!this.bajoCommonDb) return
  const { error } = this.bajo.helper
  const { recordGet } = this.bajoDb.helper
  const country = await recordGet('CdbCountry', item, { thrownNotFound: false })
  if (country) return country.bbox
  throw error('Invalid bbox \'%s\'', item, { statusCode: 400 })
}

async function parseBbox (input) {
  const { isSet, error } = this.bajo.helper
  let bbox
  if (input) {
    const cbbox = await getCountryBbox.call(this, input)
    if (cbbox) bbox = cbbox
    else {
      const [minx, miny, maxx, maxy] = input.split(',').map(b => parseFloat(b) || null)
      const valid = isSet(minx) && isSet(miny) && isSet(maxx) && isSet(maxy)
      if (valid) bbox = [minx, miny, maxx, maxy]
      else throw error('Invalid bbox \'%s\'', input)
    }
  }
  return bbox
}

export default parseBbox
