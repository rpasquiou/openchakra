const lodash=require('lodash')
const CustomerFreelance = require("../../models/CustomerFreelance")
const User = require("../../models/User")
const { ROLE_FREELANCE, DEFAULT_SEARCH_RADIUS, AVAILABILITY_ON } = require("./consts")
const { buildPopulates, loadFromDb } = require('../../utils/database')
const { computeDistanceKm } = require('../../../utils/functions')

const computeSuggestedFreelances = async (userId, params, data)  => {
  return CustomerFreelance.find()
}

const TEXT_SEARCH_FIELDS=['position', 'description', 'motivation']

const searchFreelances = async (userId, params, data, fields)  => {
  
  console.log('Filtering with', data)
  let filter={role: ROLE_FREELANCE}
  if (data.pattern?.trim()) {
    const regExp=new RegExp(data.pattern, 'i')
    filter={...filter, $or: TEXT_SEARCH_FIELDS.map(field => ({[field]:regExp}))}
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
  if (filter.available) {
    filter.availability=AVAILABILITY_ON
  }
  if (!!data.min_daily_rate || !!data.max_daily_rate) {
    console.log('i have rates', data.min_daily_rate, data.max_daily_rate)
    filter.rate={}
    if (!!data.min_daily_rate) {
      console.log('i have a min')
      filter.rate={...filter.rate, $gte: data.min_daily_rate}
    }
    if (!!data.max_daily_rate) {
      console.log('i have a max')
      filter.rate={...filter.rate, $lte: data.max_daily_rate}
    }
  }

  console.log('filter', filter)
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

module.exports={
  computeSuggestedFreelances, searchFreelances, countFreelances,
}