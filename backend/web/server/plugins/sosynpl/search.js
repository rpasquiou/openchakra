/*TODO:
  - Loaded user misses experiences and trainings
*/
const lodash=require('lodash')
const CustomerFreelance = require("../../models/CustomerFreelance")
const User = require("../../models/User")
const { ROLE_FREELANCE, DEFAULT_SEARCH_RADIUS, AVAILABILITY_ON, ANNOUNCE_STATUS_ACTIVE, DURATION_FILTERS, WORK_MODE, WORK_MODE_SITE, WORK_MODE_REMOTE, WORK_MODE_REMOTE_SITE, WORK_DURATION_LESS_1_MONTH, WORK_DURATION_MORE_6_MONTH, WORK_DURATION__1_TO_6_MONTHS, MOBILITY_FRANCE, MOBILITY_NONE, DURATION_UNIT_DAYS, MOBILITY_CITY, MOBILITY_REGIONS } = require("./consts")
const { computeDistanceKm } = require('../../../utils/functions')
const Announce = require('../../models/Announce')
const { REGIONS_FULL } = require('../../../utils/consts')
const { loadFromDb } = require('../../utils/database')
const { freelanceMissingAttributes } = require('./freelance')

const computeSuggestedFreelances = async (userId, params, data) => {
  const getRegionFromZipcode = (zipcode) => {
    const departmentCode = String(zipcode).substring(0, 2)
    const region = lodash.pickBy(REGIONS_FULL, (region) =>
      region.departements.includes(departmentCode)
    )
    return Object.keys(region)[0] || null
  }

  const MAP_WORKMODE = {
    0: WORK_MODE_SITE,
    5: WORK_MODE_REMOTE,
  }

  const durationDays = data.duration * DURATION_UNIT_DAYS[data.duration_unit]
  const workDuration =
    durationDays < 30
      ? WORK_DURATION_LESS_1_MONTH
      : durationDays > 180
      ? WORK_DURATION_MORE_6_MONTH
      : WORK_DURATION__1_TO_6_MONTHS
  const workMode = MAP_WORKMODE[data.homework_days] || WORK_MODE_REMOTE_SITE

  const POWERS = {
    main_job: 1,
    work_sector: 1,
    expertises: 1,
    softwares: 1,
    languages: 1,
    main_experience: 1,
    work_mode: 1,
    work_duration: 1,
    mobility: 1,
    freelance_profile_completion: 1,
    availability: 1,
  }

  const incrementScore = (condition, scoreKey) => (condition ? POWERS[scoreKey] : 0)

  const frWithScore = {}
  let freelances = await CustomerFreelance.find({ role: ROLE_FREELANCE })
    .populate('experiences')
    .populate('trainings')

  freelances = freelances.filter(freelance => freelance.freelance_profile_completion === 1)

  freelances.forEach((freelance) => {
    let score = 0
    let regionKey

    score += incrementScore(freelance.main_job && String(freelance.main_job) === String(data.job._id), 'main_job')
    score += incrementScore(freelance.work_sector && data.sectors.some(sector => String(sector._id) === String(freelance.work_sector)), 'work_sector')
    score += incrementScore(freelance.expertises && data.expertises.some(exp => String(freelance.expertises).includes(String(exp._id))), 'expertises')
    score += incrementScore(freelance.softwares && data.softwares.some(sw => String(freelance.softwares).includes(String(sw._id))), 'softwares')
    score += incrementScore(freelance.languages && data.languages.some(lang => String(freelance.languages).includes(String(lang._id))), 'languages')
    score += incrementScore(freelance.main_experience && data.experience.includes(freelance.main_experience), 'main_experience')
    score += incrementScore(freelance.work_mode && freelance.work_mode === (data.homework_days === 5 ? WORK_MODE_REMOTE : workMode), 'work_mode')
    score += incrementScore(freelance.work_duration && freelance.work_duration.includes(workDuration), 'work_duration')

    if (data.city && data.city.zip_code) {
      regionKey = getRegionFromZipcode(data.city.zip_code)
    }

    if (freelance.mobility == MOBILITY_FRANCE) {
      score += POWERS.mobility
    } else {
      if (data.mobility === MOBILITY_NONE) {
        if (
          (freelance.mobility === MOBILITY_CITY &&
            computeDistanceKm(data.city, freelance.mobility_city) < freelance.mobility_city_distance) ||
          (freelance.mobility === MOBILITY_REGIONS && freelance.mobility_regions.includes(regionKey))
        ) {
          score += POWERS.mobility
        }
      } else if (data.mobility === MOBILITY_REGIONS) {
        if (
          (freelance.mobility === MOBILITY_REGIONS && freelance.mobility_regions.includes(data.mobility_regions)) ||
          (freelance.mobility === MOBILITY_CITY && data.mobility_regions.includes(getRegionFromZipcode(freelance.mobility_city.zip_code)))
        ) {
          score += POWERS.mobility
        }
      }
    }

    score += incrementScore(freelance.freelance_profile_completion && freelance.freelance_profile_completion === 1, 'freelance_profile_completion')
    score += incrementScore(
      (freelance.availability && freelance.availability === AVAILABILITY_ON) ||
      (freelance.available_from && new Date(freelance.available_from) <= new Date(data.start_date)),
      'availability'
    )

    frWithScore[freelance._id] = score
  })

  const sortedFreelances = Object.keys(frWithScore)
    .sort((a, b) => frWithScore[b] - frWithScore[a])
    .slice(0, 5)
    .map(id => freelances.find(f => f._id.toString() === id))

  return sortedFreelances
}

const PROFILE_TEXT_SEARCH_FIELDS=['position', 'description', 'motivation']

const searchFreelances = async (userId, params, data, fields)  => {
  
  let filter={role: ROLE_FREELANCE}
  if (data.pattern?.trim()) {
    const regExp=new RegExp(data.pattern, 'i')
    filter={...filter, $or: PROFILE_TEXT_SEARCH_FIELDS.map(field => ({[field]:regExp}))}
  }
  if (!lodash.isEmpty(data.work_modes)) {
    filter.work_mode={$in: data.work_modes}
  }
  if (!lodash.isEmpty(data.work_durations)) {
    filter.work_duration={$in: data.work_durations}
  }
  if (!lodash.isEmpty(data.experiences)) {
    filter.main_experience={$in: data.experiences}
  }
  if (!lodash.isEmpty(data.sectors)) {
    filter.work_sector={$in: data.sectors}
  }
  if (!lodash.isEmpty(data.expertises)) {
    filter.expertises={$in: data.expertises}
  }
  if (!!data.available) {
    filter.availability=AVAILABILITY_ON
  }
  if (!!data.min_daily_rate || !!data.max_daily_rate) {
    console.log('i have rates', data.min_daily_rate, data.max_daily_rate)
    filter.rate={}
    if (!!data.min_daily_rate) {
      filter.rate={...filter.rate, $gte: data.min_daily_rate}
    }
    if (!!data.max_daily_rate) {
      filter.rate={...filter.rate, $lte: data.max_daily_rate}
    }
  }

  params=lodash(filter)
    .mapKeys((v,k) => `filter.${k}`)
    .value()

  fields=[...fields, 'shortname', 'firstname', 'lastname', 'address', 'pinned_by', 'pinned']
  let candidates=await loadFromDb({model: 'customerFreelance', user: userId, fields, params}) // await CustomerFreelance.find({...filter})
  if (!lodash.isEmpty(data.city)) {
    candidates=candidates.filter(c => {
      const distance=computeDistanceKm(c.address, data.city)
      return !lodash.isNil(distance) && distance < (data.city_radius || DEFAULT_SEARCH_RADIUS)
    })
  }
  candidates=candidates.map(c => new CustomerFreelance(c))
  return candidates
}

// TODO: database should compute fields using dependency tree, so I can get data.profiles.length
const countFreelances = async (userId, params, data, fields)  => {
  const freelances=await searchFreelances(userId, params, data, fields)
  return freelances.length
}

const ANNOUNCE_TEXT_SEARCH_FIELDS=['description', 'expectation', 'company_description','team_description']

const searchAnnounces = async (userId, params, data, fields)  => {
  // console.log('Filtering announces with', data)

  let filter={status: ANNOUNCE_STATUS_ACTIVE}

  if (data.pattern?.trim()) {
    const regExp=new RegExp(data.pattern, 'i')
    filter={...filter, $or: ANNOUNCE_TEXT_SEARCH_FIELDS.map(field => ({[field]:regExp}))}
  }
  // if (!lodash.isEmpty(data.work_modes)) {
  //   filter.work_mode={$in: data.work_modes}
  // }
  if (!lodash.isEmpty(data.experiences)) {
    filter.experience={$in: data.experiences}
  }
  if (!lodash.isEmpty(data.sectors)) {
    filter.sectors={$in: data.sectors}
  }
  if (!lodash.isEmpty(data.expertises)) {
    filter.expertises={$in: data.expertises}
  }

  fields=[...fields, 'pinned_by', 'pinned']
  params=lodash(filter)
  .mapKeys((v,k) => `filter.${k}`)
  .value()

  // let candidates=await Announce.find({...filter}).populate('user')
  let candidates=await loadFromDb({model: 'announce', user: userId, fields, params})

  // Filter city & distance
  if (!lodash.isEmpty(data.city)) {
    candidates=candidates.filter(c => {
      const distance=computeDistanceKm(c.city, data.city)
      console.log('city', c.city, 'distance', distance, 'to', data.city)
      return !lodash.isNil(distance) && distance < (data.city_radius || DEFAULT_SEARCH_RADIUS)
    })
  }

  // Filter durations
  if (!lodash.isEmpty(data.work_durations)) {
    candidates=candidates.filter(c => {
      const matches=data.work_durations.find(duration => DURATION_FILTERS[duration](c._duration_days))
      return matches
    })
  }

  // Filter price rates
  if (!!data.min_daily_rate) {
    candidates = candidates.filter(c => c.average_daily_rate >= data.min_daily_rate)
  }
  if (!!data.max_daily_rate) {
    candidates = candidates.filter(c => c.average_daily_rate <= data.max_daily_rate)
  }

  candidates=candidates.map(c => new Announce(c))
  return candidates
}

const countAnnounce = async (userId, params, data, fields)  => {
  const announces=await searchAnnounces(userId, params, data, fields)
  return announces.length
}

module.exports={
  computeSuggestedFreelances, searchFreelances, countFreelances, searchAnnounces, countAnnounce,
}