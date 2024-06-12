const mongoose=require("mongoose")
const moment=require("moment")
const lodash=require("lodash")
const User = require("../../models/User")
const Announce = require("../../models/Announce")
const Application = require("../../models/Application")
const Quotation = require("../../models/Quotation")
const CustomerFreelance = require("../../models/CustomerFreelance")
const { getModel, loadFromDb, idEqual } = require("../../utils/database")
const { NotFoundError, BadRequestError, ForbiddenError } = require("../../utils/errors")
const { addAction, setAllowActionFn } = require("../../utils/studio/actions")
const { ROLE_ADMIN } = require("../smartdiet/consts")
const { ACTIVITY_STATE_SUSPENDED, ACTIVITY_STATE_ACTIVE, ACTIVITY_STATE_DISABLED, ANNOUNCE_STATUS_DRAFT, ANNOUNCE_SUGGESTION_REFUSED, APPLICATION_STATUS_DRAFT, APPLICATION_STATUS_SENT} = require("./consts")
const {clone} = require('./announce')
const AnnounceSuggestion = require("../../models/AnnounceSuggestion")
const { sendSuggestion2Freelance, sendApplication2Customer } = require("./mailing")
const { sendQuotation } = require("./quotation")

const validate_email = async ({ value }) => {
  const user=await User.exists({_id: value})
  if (!user) {
    throw new NotFoundError(`Ce compte n'existe pas`)
  }
  return User.findByIdAndUpdate(value, {email_valid: true})
}

addAction('validate_email', validate_email)

const deactivateAccount = async ({reason}, user) => {
  const ok=await isActionAllowed({action:'deactivateAccount', user})
  if (!ok) {return false}
  const model=await getModel(user._id)
  return mongoose.models[model].findByIdAndUpdate(
    user._id,
    {activity_status: ACTIVITY_STATE_DISABLED, deactivation_reason: reason},
    {runValidators: true, new: true},
  )
}
addAction('deactivateAccount', deactivateAccount)

const suspendAccount = async ({value, reason}, user) => {
  const ok=await isActionAllowed({action:'suspend_account', dataId: value, user})
  if (!ok) {return false}
  const model=await getModel(value)
  await mongoose.models[model].findByIdAndUpdate(
    value,
    {activity_status: ACTIVITY_STATE_SUSPENDED, suspended_reason: reason},
    {runValidators: true, new: true},
  )
}
addAction('suspend_account', suspendAccount)

const activateAccount = async ({value, reason}, user) => {
  const ok=await isActionAllowed({action:'activate_account', dataId: value, user})
  console.log('can activate', !!ok)
  if (!ok) {return false}
  const model=await getModel(value)
  return mongoose.models[model].findByIdAndUpdate(
    value,
    {activity_status: ACTIVITY_STATE_ACTIVE, suspended_reason:null},
    {runValidators: true, new: true},
  )
}
addAction('activate_account', activateAccount)

const publishAction = async ({value}, user) => {
  const ok=await isActionAllowed({action:'publish', dataId: value, user})
  if (!ok) {return false}
  const model=await getModel(value, ['announce', 'application'])
  if (model=='application') {
    return publishApplication({value}, user)
  }
  return publishAnnounce({value}, user)
}

const publishApplication = async ({value}, user) => {
  const application=await Application.findById(value).populate(['quotations', {path: 'announce', populate: 'user'}, 'freelance'])
  application.sent_date=moment()
  application.status=APPLICATION_STATUS_SENT
  await sendQuotation(application.quotations[0]._id)
  const res=await application.save()
  await sendApplication2Customer({freelance: application.freelance, announce: application.announce, customer: application.announce.user})
  return res
}

const publishAnnounce = async ({value}, user) => {
  const announce=await Announce.findById(value)
  announce.publication_date=moment()
  // Save also validates the model
  await announce.save()
  // If selected freelances, create announce_suggesitons and send mails
  if (!lodash.isEmpty(announce.selected_freelances)) {
    const handleSuggestion = async freelanceId => {
      await AnnounceSuggestion.findOneAndUpdate(
        {freelance: freelanceId,  announce},
        {user: user._id, freelance: freelanceId,  announce},
        {upsert: true, new: true},
        )
      const freelance=await CustomerFreelance.findById(freelanceId)
      await sendSuggestion2Freelance({user: freelance, announce})
    }
    await Promise.all(announce.selected_freelances.map(freelance => handleSuggestion(freelance._id)))
  }
  return announce
}
addAction('publish', publishAction)

const cloneAction = async ({value}, user) => {
  const ok=await isActionAllowed({action:'clone', dataId: value, user})
  if (!ok) {return false}
  const cloned=await clone(value)
  return cloned
}
addAction('clone', cloneAction)

const refuseAction = async ({value, reason}, user) => {
  const ok=await isActionAllowed({action:'refuse', dataId: value, user})
  if (!ok) {return false}
  // Ensure is announce or announceSuggestion
  const model=await getModel(value, ['announce','announceSuggestion'])
  let filter={freelance: user._id}
  if (model=='announce') {
    filter={...filter, announce: value}
  }
  else { // Is announceSuggestion
    filter={_id: value}
  }
  const update={status: ANNOUNCE_SUGGESTION_REFUSED, refuse_date: moment(), refuse_reason: reason}
  return AnnounceSuggestion.findOneAndUpdate(filter, update)
}
addAction('refuse', refuseAction)


const isActionAllowed = async ({ action, dataId, user, actionProps }) => {
  if (action=='validate_email') {
    return true
  }
  if (action=='register') {
    return true
  }
  if (action=='deactivateAccount') {
    const logged_user=await User.findById(user._id, {active:1})
    if (logged_user.active==false) {
      throw new BadRequestError(`Ce compte est déjà désactivé`)
    }
  }
  if (['suspend_account', 'activate_account'].includes(action)) {
    if (user.role!=ROLE_ADMIN) {
      throw new ForbiddenError('Action interdite')
    }
    const suspend=action=='suspend_account'
    const target_user=await User.findById(dataId, { activity_status:1})
    // Disabled account cannot be restored
    if (!suspend && target_user.activity_status==ACTIVITY_STATE_DISABLED) {
      throw new ForbiddenError('Un compte désactivé ne peut être réactivé')
    }
    if (suspend && target_user.activity_status==ACTIVITY_STATE_SUSPENDED) {
      throw new ForbiddenError('Compte déjà suspendu')
    }
    if (!suspend && target_user.activity_status==ACTIVITY_STATE_ACTIVE) {
      throw new ForbiddenError('Compte déjà actif')
    }
  }

  if (action=='publish') {
    const model=await getModel(dataId, ['announce', 'application'])
    if (model=='announce') {
      const announces=await loadFromDb({model: 'announce', id: dataId, fields: ['status']})
      if (!announces.length) {
        throw new NotFoundError(`Announce ${dataId} not found`)
      }
      const announce=announces[0]
      if (announce.status!=ANNOUNCE_STATUS_DRAFT) {
        throw new BadRequestError(`Announce ${dataId} must be in draft mode to publish`)
      }
    }
    if (model=='application') {
      const applications=await loadFromDb({model: 'application', id: dataId, fields: ['status']})
      if (!applications.length) {
        throw new NotFoundError(`Application ${dataId} not found`)
      }
      const application=applications[0]
      if (application.status!=APPLICATION_STATUS_DRAFT) {
        throw new BadRequestError(`La candidature a déjà été publiée`)
      }
    }
  }
  if (action=='clone') {
    const exists=await Announce.exists({_id: dataId})
    if (!exists) {
      throw new NotFoundError(`Announce ${dataId} not found`)
    }
  }

  // Can send quotatiojn if not the first (because will be sent during application publication)
  // and latest quotation is valid
  if (action=='alle_send_quotation') {
    const quotation=await Quotation.findBy(dataId, {status: 1})
    if (quotation.status!=QUOTATION_STATUS_DRAFT) {
      throw new BadRequestError(`Le devis a déjà été envoyé`)
    }
    await quotation.validate()
  }
  return true
}

setAllowActionFn(isActionAllowed)
