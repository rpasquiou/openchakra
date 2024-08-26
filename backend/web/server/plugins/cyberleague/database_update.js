const lodash=require('lodash')
const User = require('../../models/User')
const { ROLE_ADMIN, ROLE_MEMBER, ROLE_PARTNER } = require('./consts')

const log = (...params) => {
  return console.log(`DB Update`, ...params)
}

const error = (...params) => {
    return console.error(`DB Update`, ...params)
}

const normalizeRoles = async () => {
  log(`Normalizing roles`)

  const normalizeRole = async user => {
    const oldRoles = [`MEMBER`, `PARTNER`, `ADMIN`]
    if (!(user.role in oldRoles)) {
        error(`Invalid role`, user.role, `for`, user._id);            
    }

    user.role = `ROLE_` + user.role
    log(`Role normalized for`, user._id)
    return user.save()
  }

  return User.find({role: {$nin: [ROLE_ADMIN, ROLE_MEMBER, ROLE_PARTNER]}})
    .then(users => Promise.allSettled(users.map(u => normalizeRole(u))))
    .then(res => res.some(r => r.status==`rejected`) && log(JSON.stringify(lodash.groupBy(res, `status`).rejected)))
}

const databaseUpdate = async () => {
  console.log('************ UPDATING DATABASE')
  await normalizeRoles()
}

module.exports=databaseUpdate