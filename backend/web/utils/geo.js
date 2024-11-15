const nominatim=require('nominatim-client')
const lodash=require('lodash')

const getLocationSuggestions = (value, type) => {
  const suffixMatch = value.match(/\b(BIS|TER|QUATER|ANTE|A|B|C|D|E|F|G|H)\b/i)
  const suffix = suffixMatch ? suffixMatch[0] : ''
  const cleanValue = value.replace(/\b(BIS|TER|QUATER|ANTE|A|B|C|D|E|F|G|H)\b/i, '').trim()
  const cityOnly=type=='city'
  const client = nominatim.createClient({
    useragent: 'My Alfred',
    referer: 'https://my-alfred.io',
  })
  const query={dedupe:1, addressdetails: 1, countrycodes: 'fr'}
  if (cityOnly) {
    query.city= cleanValue
  }
  else {
    query.q= cleanValue
  }
  return client.search(query)
    .then(res => {
      let suggestions=lodash.orderBy(res, r => -r.importance)
      if (cityOnly) {
        suggestions=res.filter(r => r.address && r.lat && r.lon && r.address.state && ((r.address.city || r.address.village || r.address.town)))
      }
      else {
        suggestions=res.filter(r => r.address && r.lat && r.lon && r.address.state && (r.address.postcode && r.address.road && (r.address.city || r.address.village || r.address.town || r.address.county)))
      }
      console.log('Suggestions', JSON.stringify(suggestions, null, 2))
      suggestions=suggestions.map(r => ({
        address: r.address.road,
        city: r.address.city || r.address.village || r.address.town || r.address.county,
        zip_code: r.address.postcode,
        country: r.address.country,
        latitude: r.lat,
        longitude: r.lon,
        region: r.address.state,
      }))

      suggestions=lodash.uniqBy(suggestions, r => (cityOnly ? `${r.city},${r.zip_code},${r.country},${r.region}`: `${r.name},${r.city},${r.zip_code},${r.country},${r.region}`))
      const number=parseInt(value)
      if (!isNaN(number)) {
        suggestions=suggestions.map(r => ({
          ...r, 
          address: suffix ? `${number} ${suffix} ${r.address}` : `${number} ${r.address}`
        }))
      }
      return suggestions
    })
}

module.exports={getLocationSuggestions}
