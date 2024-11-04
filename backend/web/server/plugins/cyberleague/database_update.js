const User = require('../../models/User')
const { ROLE_ADMIN, ROLE_MEMBER, ROLE_PARTNER, JOB_COMMERCIAL_MANAGER, JOB_GENERAL_MANAGER, COMPANY_SIZE_11_50, COMPANY_SIZE_1001_PLUS, SECTOR_AERONAUTICS } = require('./consts')
const Company = require('../../models/Company')
const ExpertiseSet = require('../../models/ExpertiseSet')
const Group = require('../../models/Group')
const Content = require('../../models/Content')
const Event = require('../../models/Event')

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

const normalizeCompanySize = async () => {
  log(`Normalizing company sizes`)

  const MAPPING={
    COMPANY_SIZE_11_250: COMPANY_SIZE_11_50,
    COMPANY_SIZE_5001_PLUS: COMPANY_SIZE_1001_PLUS
  }

  await Company.updateMany({size: null}, {size:COMPANY_SIZE_11_50})

  return Promise.all(Object.entries(MAPPING).map(([oldSize, newSize]) => 
    Company.updateMany({size:oldSize},{size: newSize})
  ))
}

const addExpertiseSet = async () => {

  const filter = {expertise_set: {$exists: false}}
  const blankExpertiseSet = {expertises: [], categories: []}

  log(`Adding expertiseSet to users`)
  const users = await User.find(filter)

  users.forEach(async (u) => {
    expSet = await ExpertiseSet.create(blankExpertiseSet)
    await User.findByIdAndUpdate({_id: u._id},{expertise_set: expSet._id})
  })

  log(`Adding expertiseSet to groups`)
  const groups = await Group.find(filter)

  groups.forEach(async (g) => {
    expSet = await ExpertiseSet.create(blankExpertiseSet)
    await Group.findByIdAndUpdate({_id: g._id},{expertise_set: expSet._id})
  })

  log(`Adding expertiseSet to companies`)
  const companies = await Company.find(filter)

  companies.forEach(async (c) => {
    expSet = await ExpertiseSet.create(blankExpertiseSet)
    await Company.findByIdAndUpdate({_id: c._id},{expertise_set: expSet._id})
  })

  log(`Adding expertiseSet to contents`)
  const contents = await Content.find(filter)

  contents.forEach(async (c) => {
    expSet = await ExpertiseSet.create(blankExpertiseSet)
    await Content.findByIdAndUpdate({_id: c._id},{expertise_set: expSet._id})
  })

  log(`Adding expertiseSet to events`)
  const events = await Event.find(filter)

  events.forEach(async (e) => {
    expSet = await ExpertiseSet.create(blankExpertiseSet)
    await Event.findByIdAndUpdate({_id: e._id},{expertise_set: expSet._id})
  })

}

const addSector = async () => {
  log('Add sector to companies without one')

  await Company.updateMany({sector: {$exists: false}}, {sector: SECTOR_AERONAUTICS})// if not exists

}

const databaseUpdate = async () => {
  console.log('************ UPDATING DATABASE')
  await normalizeRoles()
  await updateCompanyAdmin()
  await normalizeJobs()
  await normalizeCompanySize()
  await addExpertiseSet()
  await addSector()
}

module.exports=databaseUpdate