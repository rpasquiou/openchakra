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

  const MAPPING={
    MEMBER: ROLE_MEMBER,
    ADMIN: ROLE_ADMIN,
    PARTNER: ROLE_PARTNER
  }
  return Promise.all(Object.entries(MAPPING).map(([oldRole, newRole]) => 
    User.updateMany({role:oldRole},{role: newRole})
  ))
}

const databaseUpdate = async () => {
  console.log('************ UPDATING DATABASE')
  await normalizeRoles()
}

module.exports=databaseUpdate