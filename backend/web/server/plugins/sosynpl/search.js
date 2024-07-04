const lodash=require('lodash')
const CustomerFreelance = require("../../models/CustomerFreelance")
const User = require("../../models/User")
const { ROLE_FREELANCE, DEFAULT_SEARCH_RADIUS, AVAILABILITY_ON, ANNOUNCE_STATUS_ACTIVE, DURATION_FILTERS } = require("./consts")
const { buildPopulates, loadFromDb } = require('../../utils/database')
const { computeDistanceKm } = require('../../../utils/functions')
const Announce = require('../../models/Announce')

const computeSuggestedFreelances = async (userId, params, data)  => {
  return CustomerFreelance.find()
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

  let candidates=await CustomerFreelance.find({...filter})
  if (!lodash.isEmpty(data.city)) {
    candidates=candidates.filter(c => {
      const distance=computeDistanceKm(c.address, data.city)
      return !lodash.isNil(distance) && distance < (data.city_radius || DEFAULT_SEARCH_RADIUS)
    })
  }
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

  console.log('filter', filter)
  let candidates=await Announce.find({...filter})

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
}