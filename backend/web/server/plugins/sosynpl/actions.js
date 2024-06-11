const mongoose=require("mongoose")
const moment=require("moment")
const lodash=require("lodash")
const User = require("../../models/User")
const Announce = require("../../models/Announce")
const CustomerFreelance = require("../../models/CustomerFreelance")
const { getModel, loadFromDb } = require("../../utils/database")
const { NotFoundError, BadRequestError, ForbiddenError } = require("../../utils/errors")
const { addAction, setAllowActionFn } = require("../../utils/studio/actions")
const { ROLE_ADMIN } = require("../smartdiet/consts")
const { ACTIVITY_STATE_SUSPENDED, ACTIVITY_STATE_ACTIVE, ACTIVITY_STATE_DISABLED, ANNOUNCE_STATUS_DRAFT, ANNOUNCE_SUGGESTION_REFUSED} = require("./consts")
const {clone} = require('./announce')
const AnnounceSuggestion = require("../../models/AnnounceSuggestion")
const { sendSuggestion2Freelance } = require("./mailing")

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

const publishAnnounce = async ({value, reason}, user) => {
  const ok=await isActionAllowed({action:'publishAnnounce', dataId: value, user})
  if (!ok) {return false}
  const announce=await Announce.findById(value)
  announce.publication_date=moment()
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
addAction('publish', publishAnnounce)

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
    const announces=await loadFromDb({model: 'announce', id: dataId, fields: ['status']})
    if (!announces.length) {
      throw new NotFoundError(`Announce ${dataId} not found`)
    }
    const announce=announces[0]
    if (announce.status!=ANNOUNCE_STATUS_DRAFT) {
      throw new BadRequestError(`Announce ${dataId} must be in draft mode to publish`)
    }
  }
  if (action=='clone') {
    const exists=await Announce.exists({_id: dataId})
    if (!exists) {
      throw new NotFoundError(`Announce ${dataId} not found`)
    }
  }
  return true
}

setAllowActionFn(isActionAllowed)
