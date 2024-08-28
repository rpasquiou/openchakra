const User = require('../../models/User')
const { ROLE_ADMIN, ROLE_MEMBER, ROLE_PARTNER, JOB_COMMERCIAL_MANAGER, JOB_GENERAL_MANAGER } = require('./consts')
const Company = require('../../models/Company')

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

const updateCompanyAdmin = async () => {
  log(`Updating admin attribute`)

  const updateAdmin = async (company) => {
    const admin=company.toObject().admin
    Company.collection.updateOne({_id: company._id}, {$set: {administrators: [admin]}, $unset: {admin: 1}})
  }
  return Company.find({admin:{$ne: undefined}})
    .then(companies => Promise.all(companies.map(c => updateAdmin(c))))
}

const normalizeJobs = async () => {
  log(`Normalizing jobs`)

  const MAPPING={
    COMMERCIIAL_MANAGER: JOB_COMMERCIAL_MANAGER,
    GENERAL_MANAGER: JOB_GENERAL_MANAGER
  }
  return Promise.all(Object.entries(MAPPING).map(([oldJob, newJob]) => 
    User.updateMany({job:oldJob},{job: newJob})
  ))
}

const databaseUpdate = async () => {
  console.log('************ UPDATING DATABASE')
  await normalizeRoles()
  await updateCompanyAdmin()
  await normalizeJobs()
}

module.exports=databaseUpdate