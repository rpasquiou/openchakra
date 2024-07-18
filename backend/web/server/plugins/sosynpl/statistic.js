const Mission = require("../../models/Mission")
const { ROLE_CUSTOMER, ROLE_FREELANCE } = require("./consts")
const CustomerFreelance = require('../../../server/models/CustomerFreelance')
const User = require("../../models/User")

const usersCount = async() => {
  return await User.countDocuments({})
}

const customersCount = async() => {
  return await User.countDocuments({role: ROLE_CUSTOMER})
}

const freelancesCount = async() => {
  return await User.countDocuments({role: ROLE_FREELANCE})
}

const currentMissionsCount = async() => {
  return await Mission.countDocuments({start_date: {$lt: new Date()}, end_date: {$gt: new Date()}})
}

const comingMissionsCount = async() => {
  return await Mission.countDocuments({start_date: {$gt: new Date()} })
}

module.exports={
  usersCount, customersCount, freelancesCount, currentMissionsCount, comingMissionsCount
}