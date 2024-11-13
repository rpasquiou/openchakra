/*TODO:
  - Loaded user misses experiences and trainings
*/
const lodash=require('lodash')
const CustomerFreelance = require("../../models/CustomerFreelance")
const Sector = require("../../models/Sector")
const { ROLE_FREELANCE, DEFAULT_SEARCH_RADIUS, AVAILABILITY_ON, ANNOUNCE_STATUS_ACTIVE, DURATION_FILTERS, WORK_MODE, WORK_MODE_SITE, WORK_MODE_REMOTE, WORK_MODE_REMOTE_SITE, WORK_DURATION_LESS_1_MONTH, WORK_DURATION_MORE_6_MONTH, WORK_DURATION__1_TO_6_MONTHS, MOBILITY_FRANCE, MOBILITY_NONE, DURATION_UNIT_DAYS, MOBILITY_CITY, MOBILITY_REGIONS } = require("./consts")
const { computeDistanceKm } = require('../../../utils/functions')
const Announce = require('../../models/Announce')
const { REGIONS_FULL, SEARCH_FIELD_ATTRIBUTE } = require('../../../utils/consts')
const { loadFromDb, setIntersects, idEqual } = require('../../utils/database')
const search = require('../../utils/search')

// Limit results if no pattern or city was provided
const MAX_RESULTS_NO_CRITERION=12

const FREELANCE_SUGGESTION_REQUIRES = [
  'job',
  'sectors',
  'expertises',
  'softwares',
  'languages',
  'experience',
  'homework_days',
  'duration',
  'mobility'
]

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

  let frWithScore = {}
  let freelances = await CustomerFreelance.find({ role: ROLE_FREELANCE })
    .populate('experiences')
    .populate('trainings')

  freelances.forEach((freelance) => {
    let score = 0
    let regionKey

    score += incrementScore(freelance.main_job && String(freelance.main_job) === String(data.job), 'main_job')
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
          (freelance.mobility === MOBILITY_REGIONS && freelance.mobility_regions?.includes(data.mobility_regions)) ||
          (freelance.mobility === MOBILITY_CITY && data.mobility_regions?.includes(getRegionFromZipcode(freelance.mobility_city.zip_code)))
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

const searchFreelances = async (userId, params, data, fields)  => {
  let filter = { ...params, 'filter.role': ROLE_FREELANCE }

  fields = [...fields, 'freelance_profile_completion', 'freelance_missing_attributes', 'trainings', 'experiences', 'expertises', 'firstname', 'lastname']

  if (!lodash.isEmpty(data.work_modes)) {
    filter['filter.work_mode'] = { $in: data.work_modes }
  }
  if (!lodash.isEmpty(data.work_durations)) {
    filter['filter.work_duration'] = { $in: data.work_durations }
  }
  if (!lodash.isEmpty(data.experiences)) {
    filter['filter.main_experience'] = { $in: data.experiences }
  }
  if (!!data.available) {
    filter['filter.availability'] = AVAILABILITY_ON
  }
  if (!!data.min_daily_rate || !!data.max_daily_rate) {
    filter['filter.rate'] = {}
    if (!!data.min_daily_rate) {
      filter['filter.rate'] = { ...filter['filter.rate'], $gte: data.min_daily_rate }
    }
    if (!!data.max_daily_rate) {
      filter['filter.rate'] = { ...filter['filter.rate'], $lte: data.max_daily_rate }
    }
  }
  let freelances = await search({
    model: 'customerFreelance',
    fields,
    user: userId,
    params: lodash.omitBy(filter, (_, k) => /^limit/.test(k)),
    search_field: SEARCH_FIELD_ATTRIBUTE,
    search_value: data.pattern || '',
  })

  // Filtrer par distance après la recherche
  if (!lodash.isEmpty(data.city)) {
    freelances = freelances.filter((freelance) => {

      const cityMatch = freelance.headquarter_address?.city?.toLowerCase() === data.city.city?.toLowerCase()
      const regionMatch = freelance.headquarter_address?.region?.toLowerCase() === data.city.region?.toLowerCase()

      const exactMatch = cityMatch && regionMatch

      if (exactMatch) {
        return true
      }

      if (data.city_radius) {
        const distance = computeDistanceKm(freelance.headquarter_address, data.city)
        const isInRadius = !lodash.isNil(distance) && distance < data.city_radius
        return isInRadius
      }

      return false
    })
  }

  if (!lodash.isEmpty(data.expertises)) {
    freelances=freelances.filter(f => setIntersects(f.expertises, data.expertises))
  }

  if (!lodash.isEmpty(data.sectors)) {
    const allSectors=await Sector.findOne({name: /tou.*sect/i})
    // If filter by "All sectors" => don't filter
    if (!data.sectors.some(s => idEqual(s._id, allSectors._id))) {
      freelances=freelances.filter(f => {
        // Freelances with "All sectors" will be returned
        return f.work_sector.find(s => idEqual(s._id, allSectors._id))
          || setIntersects(f.work_sector, data.sectors)
      })
    }
  }


  freelances = freelances.filter(c => c.freelance_profile_completion === 1)

  // Limiter les résultats si aucun critère n'a été fourni
  if (!data.pattern?.trim() && !data.city) {
    freelances = freelances.slice(0, MAX_RESULTS_NO_CRITERION)
  }

  freelances = Object.keys(freelances).map(c => new CustomerFreelance(freelances[c]))
  return freelances
}

// TODO: database should compute fields using dependency tree, so I can get data.profiles.length
const countFreelances = async (userId, params, data, fields)  => {
  const freelances=await searchFreelances(userId, params, data, fields)
  return freelances.length
}

const ANNOUNCE_TEXT_SEARCH_FIELDS=['description', 'expectation', 'company_description','team_description']

const searchAnnounces = async (userId, params, data, fields)  => {

  let filter={status: ANNOUNCE_STATUS_ACTIVE}

  if (!lodash.isEmpty(data.experiences)) {
    filter.experience={$in: data.experiences}
  }
  
  if (!lodash.isEmpty(data.sectors)) {
    filter.sectors={$in: data.sectors}
  }
  
  if (!lodash.isEmpty(data.expertises)) {
    filter.expertises={$in: data.expertises}
  }

  if (data.pattern?.trim()) {
    let candidates = []
    const regExp=new RegExp(data.pattern, 'i')
    ANNOUNCE_TEXT_SEARCH_FIELDS.forEach(async(field) => { 
      const newFilter = {...filter, ...{[field]:regExp}}
      const cand = await processFilters(params, fields, data, newFilter, userId)
      candidates = [...candidates, ...cand]
    })

    return candidates
  }

  else {
    return await processFilters(params, fields, data, filter, userId)
  }


  // if (!lodash.isEmpty(data.work_modes)) {
  //   filter.work_mode={$in: data.work_modes}
  // }
  
}

const processFilters = async (params, f, data, filter, userId) => {
  let fields=[...f, 'pinned_by', 'pinned']
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
  return candidates
}

const countAnnounce = async (userId, params, data, fields)  => {
  const announces=await searchAnnounces(userId, params, data, fields)
  return announces.length
}

module.exports={
  computeSuggestedFreelances, searchFreelances, countFreelances, searchAnnounces, countAnnounce,
  FREELANCE_SUGGESTION_REQUIRES
}