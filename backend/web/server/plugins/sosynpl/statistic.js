const Mission = require("../../models/Mission")
const { ROLE_CUSTOMER, ROLE_FREELANCE } = require("./consts")
const User = require("../../models/User")
const Measure = require('../../models/Measure')
const moment = require('moment')

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

const registrationStatistic = async () => {
  const result = {}
  for (let i = 0; i < 12; i++) {
    const firstDayOfMonth = moment().subtract(i, 'months').startOf('month').format('YYYY-MM-DD')
    result[firstDayOfMonth] = {
      customers_count: 0,
      freelances_count: 0
    }
  }
  const users = await User.find()
  users.forEach(user => {
    const date = moment(user.creation_date).startOf('month').format('YYYY-MM-DD')
    if (result[date]) {
      if (user.role === ROLE_CUSTOMER) {
        result[date].customers_count += 1
      } else if (user.role === ROLE_FREELANCE) {
        result[date].freelances_count += 1
      }
    }
  })
  const measures = await Promise.all(Object.keys(result).map(date => {
    const measure = new Measure({
      date: moment(date).toDate(),
      customers_count: result[date].customers_count,
      freelance_count: result[date].freelances_count
    })
    return measure.save()
  }))

  return measures
}

module.exports={
  usersCount, customersCount, freelancesCount, currentMissionsCount, comingMissionsCount, registrationStatistic
}