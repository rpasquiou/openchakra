const lodash=require('lodash')
const CustomerFreelance = require("../../models/CustomerFreelance")
const User = require("../../models/User")
const { ROLE_FREELANCE } = require("./consts")
const { buildPopulates, loadFromDb } = require('../../utils/database')
const { computeDistanceKm } = require('../../../utils/functions')

const computeSuggestedFreelances = async (userId, params, data)  => {
  return CustomerFreelance.find()
}

const searchFreelances = async (userId, params, data, fields)  => {
  const filter={role: ROLE_FREELANCE}
  if (data.pattern?.trim()) {
    filter.description=new RegExp(data.pattern, 'i')
  }
  let candidates=await CustomerFreelance.find({...filter})
  if (!!data.city) {
    candidates=candidates.filter(c => {
      const distance=computeDistanceKm(c.address, data.city)
      return !lodash.isNil(distance) && distance < (data.city_radius || DEFAULT_SEARCH_RADIUS)
    })
  }
  return candidates
}

module.exports={
  computeSuggestedFreelances, searchFreelances,
}