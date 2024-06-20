const moment = require('moment')
const { loadFromDb } = require('../../utils/database')
const { BadRequestError } = require('../../utils/errors')
const Mission = require('../../models/Mission')
const Application = require('../../models/Application')

const canStartMission = async applicationId => {
  const missionExists=await Mission.exists({application: applicationId})
  if (missionExists) {
    throw new BadRequestError(`Une mission pour cette candidature existe déjà`)
  }
  const application=await loadFromDb({model: 'application', id: applicationId, fields:['latest_quotations.expiration_date']})
  if (!(moment().isBefore(application[0]?.latest_quotations?.[0]?.expiration_date))) {
    throw new BadRequestError(`Le devis pour cette candidature est expiré`)
  } 
}

const startMission = async applicationId => {
  const application=await Application.findById(applicationId).populate('announce')
  return Mission.create({
    title: application.announce.title,
    application,
    start_date: application.start_date,
    end_date: application.end_date,
  })
}

module.exports={
  canStartMission, startMission,
}