const mongoose = require('mongoose')
const Mission = require("../../models/Mission")
const { ROLE_CUSTOMER, ROLE_FREELANCE, MISSION_STATUS_CURRENT } = require("./consts")
const moment = require('moment')

const getCurrentMissions = async (user) => {
  const currentDate = moment().toDate()

  const matchCondition = {
    ...(user.role === ROLE_CUSTOMER ? { customer: mongoose.Types.ObjectId(user._id) } : {}),
    ...(user.role === ROLE_FREELANCE ? { freelance: mongoose.Types.ObjectId(user._id) } : {}),
    start_date: { $lte: currentDate },
    end_date: { $gt: currentDate },
    close_date: null,
    customer_finish_date: null,
    freelance_finish_date: null
  }

  const currentMissions = await Mission.find(matchCondition)

  return currentMissions
}

const getComingMissions = async (user) => {
  const currentDate = moment().toDate()

  const matchCondition = {
    ...(user.role === ROLE_CUSTOMER ? { customer: mongoose.Types.ObjectId(user._id) } : {}),
    ...(user.role === ROLE_FREELANCE ? { freelance: mongoose.Types.ObjectId(user._id) } : {}),
    start_date: { $gt: currentDate },
  }

  const comingMissions = await Mission.find(matchCondition)

  return comingMissions
}

module.exports = {
  getCurrentMissions, getComingMissions
}
