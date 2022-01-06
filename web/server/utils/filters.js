const geolib = require('geolib')
const isEmpty = require('../validation/is-empty')
const {createRegExpOR, createRegExpAND} = require('../../utils/text')
const {PRO, PART}=require('../../utils/consts')
const {normalize}=require('../../utils/text')

const isServiceUserAroundGPS = (serviceUser, coordinates) => {

  const serviceGPS = serviceUser.service_address.gps
  if (!serviceGPS) {
    console.warn(`Incorect GPS in ${ serviceUser._id }:${ JSON.stringify(serviceGPS)}`)
    return false
  }
  const latAlfred = serviceGPS.lat
  const lngAlfred = serviceGPS.lng
  if (isEmpty(latAlfred) || isEmpty(lngAlfred)) {
    console.warn(`Incorrect GPS in ${ serviceUser._id }:${ JSON.stringify(serviceGPS)}`)
    return false
  }
  // FIX : à vérifier
  /* const isNear = geolib.isPointWithinRadius({latitude: latUser, longitude: lngUser},{latitude:latAlfred,longitude:lngAlfred},(serviceUser.perimeter*1000))
      if(!isNear) {
      const removeIndex = service.findIndex(i => i._id == serviceUser._id)
      service.splice(removeIndex, 1)
      }*/
  try {
    const dist = geolib.getDistance(
      {latitude: coordinates.lat.toString(), longitude: coordinates.lng.toString()},
      {latitude: latAlfred.toString(), longitude: lngAlfred.toString()})
    let distance = geolib.convertDistance(dist, 'km')
    let in_perimeter = distance < serviceUser.perimeter
    return in_perimeter
  }
  catch (err) {
    console.error(`Error computing distance between ${JSON.stringify(coordinates)} and ${latAlfred}/${lngAlfred}:${err}`)
    return false
  }


}

const isServiceUserAtAlfredOrVisio = su => {
  return su.location.alfred || su.location.visio
}


const distanceComparator = gps => {
  const sort = (su1, su2) => {
    let d1, d2
    try {
      d1 = geolib.getDistance(gps, su1.service_address.gps)
    }
    catch (e) {
      console.warn(`Warning: GPS incorrect pour serviceUser ${su1._id}:${e}`)
      d1 = 100000
    }
    try {
      d2 = geolib.getDistance(gps, su2.service_address.gps)
    }
    catch (e) {
      console.warn(`Warning: GPS incorrect pour serviceUser ${su2._id}:${e}`)
      d2 = 100000
    }
    return d1 - d2
  }
  return sort
}


const filterServiceUsersGPS = (serviceUsers, coordinates, restrict) => {
  let filteredServiceUsers = serviceUsers.filter(su => isServiceUserAtAlfredOrVisio(su) || !restrict || isServiceUserAroundGPS(su, coordinates))
  filteredServiceUsers.sort(distanceComparator(coordinates))
  return filteredServiceUsers
}

// Check ANDed words first, then ORed if not result
const filterServicesKeyword = (serviceUsers, keyword, status, dataFn=null) => {
  const regExpFunctions = [createRegExpAND, createRegExpOR]
  const catLabel = status==PRO ? 's_professional_label' : 's_particular_label'
  // On recherche d'abord avec un AND des mots-clés
  // Si pas de résultats, on passe au OR
  for (i = 0; i < regExpFunctions.length; i++) {
    const regExpFn = regExpFunctions[i]
    const regexp = regExpFn(keyword)
    const filteredServices = serviceUsers.filter(data => {
      const service=(dataFn && dataFn(data)) || data
      return regexp.test(service && service.s_label) ||
        regexp.test(service && normalize(service.label)) ||
        regexp.test(service && service.category && service.category[catLabel]) ||
        regexp.test(normalize(service && service.description)) ||
        service.prestations.some(p => p &&
          (regexp.test(p.s_label) ||
          regexp.test(normalize(p.label)) ||
           regexp.test(normalize(p.description)) ||
           regexp.test(p.job && p.job.s_label)),
        )
    })
    if (filteredServices.length > 0) {
      return filteredServices
    }
  }
  return []
}

const filterServicesIds = (sus, serviceids) => {
  return sus.filter(su => serviceids.includes(su.service._id))
}

// For non admin, remove prestations linked to companies
// Then remove services having no prestation
const filterPartnerServices = (sus, admin) => {
  if (admin) {
    return sus
  }
  const filtered_sus = sus.map(su => {
    su.prestations = su.prestations.filter((p, index) => {
      // TODO : pourquoi j'ai des prestas à null ?
      if (!p.prestation) {
        console.error(`Missing prestations.prestation for presta #${index} in serviceUser #${su._id}`)
        console.log(su.prestations.map(p => p && p.prestation && p.prestation._id))
      }
      return p && p.prestation && !p.prestation.private_company
    })
    return su
  })
    .filter(su => su.prestations.length>0)
  return filtered_sus
}

module.exports = {
  filterServiceUsersGPS, filterServicesKeyword, distanceComparator,
  filterServicesIds, filterPartnerServices}
