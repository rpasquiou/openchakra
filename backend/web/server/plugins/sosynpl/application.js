const moment = require('moment')
const { loadFromDb } = require('../../utils/database')
const { BadRequestError, ForbiddenError } = require('../../utils/errors')
const Mission = require('../../models/Mission')
const Application = require('../../models/Application')
const { APPLICATION_STATUS_REFUSED, REFUSE_REASON_PROVIDED, APPLICATION_STATUS_ACCEPTED, APPLICATION_STATUS_DRAFT, APPLICATION_STATUS_SENT, APPLICATION_STATUS } = require('./consts')

// TODO: customer & freelance must have the required documents
const canAcceptApplication = async applicationId => {
  const missionExists = await Mission.exists({ application: applicationId })
  if (missionExists) {
    throw new BadRequestError(`Une mission pour cette candidature existe déjà`)
  }
  const application = await loadFromDb({ model: 'application', id: applicationId, fields: ['latest_quotations.expiration_date'] })
  if (!(moment().isBefore(application[0]?.latest_quotations?.[0]?.expiration_date))) {
    throw new BadRequestError(`Le devis pour cette candidature est expiré`)
  }
  if ([APPLICATION_STATUS_REFUSED, APPLICATION_STATUS_ACCEPTED].includes(application.status)) {
    throw new ForbiddenError(`Cette candidature est déjà accepté ou annulée`)
  }
}

// TODO: generate contracts on mission creation
const acceptApplication = async applicationId => {
  const application = await Application.findById(applicationId).populate('announce').populate('latest_quotations')
  await Application.updateMany(
    { announce: application.announce, _id: { $ne: application } },
    { status: APPLICATION_STATUS_REFUSED, refuse_reason: REFUSE_REASON_PROVIDED, refuse_date: moment() }
  )
  application.status = APPLICATION_STATUS_ACCEPTED
  application.accept_date = moment()
  await application.save()
  console.log(application)
  return Mission.create({
    title: application.announce.title,
    application,
    start_date: application.latest_quotations[0].start_date,
    end_date: application.latest_quotations[0].end_date,
    customer: application.announce.user,
    freelance: application.freelance,
  })

}

const canRefuseApplication = async applicationId => {
  const application=await Application.findById(applicationId)
  if (application.status!=APPLICATION_STATUS_SENT) {
    throw new ForbiddenError(`La candidature ne peut être refusée:${APPLICATION_STATUS[application.status]}`)
  }
}

const refuseApplication = async applicationId => {
  const application=await Application.findById(applicationId)
  application.status=APPLICATION_STATUS_REFUSED
  application.refuse_date=moment()
  return application.save()
}

module.exports = {
  canAcceptApplication, acceptApplication, canRefuseApplication, refuseApplication
}