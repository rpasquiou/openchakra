const mongoose=require("mongoose")
const moment=require("moment")
const lodash=require("lodash")
const User = require("../../models/User")
const Announce = require("../../models/Announce")
const Application = require("../../models/Application")
const Quotation = require("../../models/Quotation")
const CustomerFreelance = require("../../models/CustomerFreelance")
const { getModel, loadFromDb, idEqual, setpreLogin } = require("../../utils/database")
const { NotFoundError, BadRequestError, ForbiddenError } = require("../../utils/errors")
const { addAction, setAllowActionFn, ACTIONS } = require("../../utils/studio/actions")
const { ROLE_ADMIN } = require("../smartdiet/consts")
const { ACTIVITY_STATE_SUSPENDED, ACTIVITY_STATE_ACTIVE, ACTIVITY_STATE_DISABLED, ANNOUNCE_STATUS_DRAFT, ANNOUNCE_SUGGESTION_REFUSED, APPLICATION_STATUS_DRAFT, APPLICATION_STATUS_SENT, QUOTATION_STATUS_DRAFT, ANNOUNCE_STATUS_ACTIVE, ANNOUNCE_SUGGESTION_SENT, ROLE_FREELANCE, MISSION_STATUS_CURRENT, MISSION_STATUS, ROLE_CUSTOMER, MISSION_STATUS_FREELANCE_FINISHED, SUSPEND_REASON} = require("./consts")
const {clone, canCancel, cancelAnnounce} = require('./announce')
const AnnounceSuggestion = require("../../models/AnnounceSuggestion")
const { sendSuggestion2Freelance, sendApplication2Customer, sendForgotPassword, sendAccountSuspended, sendFreelanceValidated } = require("./mailing")
const { sendQuotation } = require("./quotation")
const { canAcceptApplication, acceptApplication, refuseApplication, canRefuseApplication } = require("./application")
const { canAcceptReport, sendReport, acceptReport, refuseReport, canSendReport, canRefuseReport } = require("./report")
const Mission = require("../../models/Mission")
const Evaluation = require("../../models/Evaluation")
const { generatePassword } = require("../../../utils/passwords")

const preLogin = async ({email}) => {
  const user=await CustomerFreelance.findOne({email})
  if (user && ACTIVITY_STATE_SUSPENDED==user.activity_status) {
    throw new ForbiddenError(`Ce compte est suspendu`)
  }
  if (user && ACTIVITY_STATE_DISABLED==user.activity_status) {
    throw new ForbiddenError(`Ce compte est désactivé`)
  }
}

setpreLogin(preLogin)

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
  if (!reason) {
    throw new BadRequestError(`La raison est obligatoire`)
  }
  const model=await getModel(value)
  await mongoose.models[model].findByIdAndUpdate(
    value,
    {activity_status: ACTIVITY_STATE_SUSPENDED, suspended_reason: reason},
    {runValidators: true, new: true},
  )
  const loadedUser=await mongoose.models[model].findById(value)
  await sendAccountSuspended({user: loadedUser, suspend_reason: SUSPEND_REASON[reason]})
}
addAction('suspend_account', suspendAccount)

const activateAccount = async ({value, reason}, user) => {
  const ok=await isActionAllowed({action:'activate_account', dataId: value, user})
  if (!ok) {return false}
  const model=await getModel(value)
  await mongoose.models[model].findByIdAndUpdate(
    value,
    {activity_status: ACTIVITY_STATE_ACTIVE, suspended_reason:null},
    {runValidators: true, new: true},
  )
  const loadedUser=await User.findById(value)
  await sendFreelanceValidated({user: loadedUser})
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
  announce.status=ANNOUNCE_STATUS_ACTIVE
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


const cancelAnnounceAction = async ({value}, user) => {
  const ok=await isActionAllowed({action:'alle_cancel_mission', dataId: value, user})
  if (!ok) {return false}
  return cancelAnnounce(({dataId: value}))
}

addAction('alle_cancel_mission', cancelAnnounceAction)

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
  const model=await getModel(value, ['application','announceSuggestion', 'report'])
  let filter={freelance: user._id}
  if (model=='application') {
    return refuseApplication(value)
  }
  if (model=='announceSuggestion') {
    filter={_id: value}
    const update={status: ANNOUNCE_SUGGESTION_REFUSED, refuse_date: moment(), refuse_reason: reason}
    return AnnounceSuggestion.findOneAndUpdate(filter, update)
  }
  if (model=='report') {
    return refuseReport({value, reason})
  }
}
addAction('refuse', refuseAction)

const acceptApplicationAction = async ({value, reason}, user) => {
  const ok=await isActionAllowed({action:'accept', dataId: value, user})
  if (!ok) {return false}
  const foundModel=await getModel(value, ['report', 'application'])
  if (foundModel=='application') {
    return acceptApplication(value)
  }
  if (foundModel=='report') {
    return acceptReport(value)
  }
}
addAction('accept', acceptApplicationAction)

const sendQuotationAction = async ({value, reason}, user) => {
  const ok=await isActionAllowed({action:'alle_send_quotation', dataId: value, user})
  if (!ok) {return false}
  const model=await getModel(value, ['quotation', 'report'])
  if (model=='report') {
    return sendReport(value)
  }
  if (model=='quotation') {
    return sendQuotation(value)
  }
}
addAction('alle_send_quotation', sendQuotationAction)

const finishMission = async ({value}, user) => {
  const ROLE_ATTRIBUTE={
    [ROLE_CUSTOMER]: 'customer_finish_date',
    [ROLE_FREELANCE]: 'freelance_finish_date',
    [ROLE_ADMIN]: 'close_date',
  }
  const attribute=ROLE_ATTRIBUTE[user.role]
  if (!attribute) {
    throw new ForbiddenError(`Vous n'avez pas le droit de terminer une mission`)
  }
  // Create evaluation if the freelance finished the mission
  if (user.role==ROLE_FREELANCE) {
    const mission=await Mission.findById(value._id)
    await Evaluation.findOneAndUpdate(
      {mission: value._id},
      {mission: value._id, customer: mission.customer, freelance: mission.freelance},
      {upsert: true}
    )
  }
  return Mission.findByIdAndUpdate(value._id, {[attribute]: moment()})
}
addAction('alle_finish_mission', finishMission)

const forgotPasswordAction= async ({context, parent, email}) => {
  const account=await User.findOne({email})
  console.log(`Forgot password for ${email}: account found`, !!account)
  if (account) {
    const password=await generatePassword()
    await User.findByIdAndUpdate(account._id, {password} )
    return sendForgotPassword({user: account, password})
  }
}
addAction('forgotPassword', forgotPasswordAction)

const resetSoftSkills = async ({value, model}) => {
  const foundModel = await getModel(value, mongoose[model])

  const update = {
    gold_soft_skills: [],
    silver_soft_skills: [],
    bronze_soft_skills: [],
    available_gold_soft_skills: [],
    available_silver_soft_skills: [],
    available_bronze_soft_skills: []
  }

  return mongoose.models[foundModel].findByIdAndUpdate(value, update, {new: true, runValidators: true})
}

addAction('reset_soft_skills', resetSoftSkills)

const isActionAllowed = async ({ action, dataId, user, actionProps }) => {
  if (action=='validate_email') {
    return true
  }
  if (action=='register') {
    return true
  }
  
  if (action=='create' && actionProps.model=='application') {
    const applicationExists=await Application.exists({announce: dataId, freelance: user._id})
    if (applicationExists) {
      throw new ForbiddenError(`Vous avez déjà envoyé une proposition pour cette annonce`)
    }
    const foundModel=await getModel(dataId, ['announce', 'announceSuggestion'])
    const data=await mongoose.model(foundModel).findById(dataId)
    if (foundModel=='announce') {
      if (!(data.status==ANNOUNCE_STATUS_ACTIVE)) {
        throw new ForbiddenError(`Cette annonce n'est pas active`)
      }
    }
    if (foundModel=='announceSuggestion') {
      if (!(data.status==ANNOUNCE_SUGGESTION_SENT)) {
        throw new ForbiddenError(`Cette proposition est déjà accepté ou refusée`)
      }
    }
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
    console.log('getting model for', dataId)
    const model=await getModel(dataId, ['announce', 'application'])
    if (model=='announce') {
      const announces=await loadFromDb({model: 'announce', id: dataId, fields: ['status', 'work_mode_site', 'work_mode_remote', 'cgu_accepted']})
      if (!announces.length) {
        throw new NotFoundError(`Announce ${dataId} not found`)
      }
      const announce=announces[0]
      if (announce.status!=ANNOUNCE_STATUS_DRAFT) {
        throw new BadRequestError(`Announce ${dataId} must be in draft mode to publish`)
      }

      if (!announce.work_mode_site && !announce.work_mode_remote) {
        throw new BadRequestError(`Vous devez choisir au moins un mode de travail`)
      }

      if (!announce.cgu_accepted) {
        throw new BadRequestError(`Vous devez accepter les CGU`)
      }
    }
    if (model=='application') {
      const application=await Application.findById(dataId).populate({path: 'quotations', populate: 'details'})
      if (!application) {
        throw new NotFoundError(`Application ${dataId} not found`)
      }
      await application.validate()
      if (application.status!=APPLICATION_STATUS_DRAFT) {
        throw new BadRequestError(`La candidature a déjà été publiée`)
      }
      const firstQuotation=application.quotations[0]
      await firstQuotation.validate()
      if (lodash.isEmpty(firstQuotation)) {
        throw new BadRequestError(`Le devis est obligatoire`)
      }
      await firstQuotation.validate()
      if (lodash.isEmpty(firstQuotation)) {
        throw new BadRequestError(`Le devis est obligatoire`)
      }
      const firstDetail=firstQuotation.details[0]
      if (lodash.isEmpty(firstDetail)) {
        throw new BadRequestError(`Le devis n'a aucune ligne de détail`)
      }
      await firstDetail.validate()
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
    const foundModel=await getModel(dataId, ['report', 'quotation'])
    if (foundModel=='quotation') {
      const quotation=await Quotation.findById(dataId, {status: 1})
        .populate([{path: 'application', populate: 'quotations'}, 'details'])
      if (idEqual(quotation._id, quotation.application.quotations[0]?._id)) {
        throw new BadRequestError(`Le premier devis sera envoyé avec la candidature`)
      }
      if (quotation.status!=QUOTATION_STATUS_DRAFT) {
        throw new BadRequestError(`Le devis a déjà été envoyé`)
      }
      await quotation.validate()
      if (lodash.isEmpty(quotation.details)) {
        throw new BadRequestError(`Le devis est vide`)
      }
      await quotation.details[0].validate()
    }
    if (foundModel=='report') {
      return canSendReport(dataId)
    }
  }

  if (action=='accept') {
    const foundModel=await getModel(dataId)
    if (!['report', 'application'].includes(foundModel)) {
      throw new BadRequestError(`Ne peut être accepté, modèle ${foundModel} incorrect`)
    }
    if (foundModel=='application') {
      await canAcceptApplication(dataId)
    }
    if (foundModel=='report') {
      await canAcceptReport(dataId)
    }
  }

  if (action=='alle_cancel_mission') {
    const foundModel=await getModel(dataId)
    if (foundModel!='announce') {
      throw new BadRequestError(`Ne peut être annulé`)
    }
    await canCancel({dataId, userId: user._id})
  }

  if (action=='refuse') {
    const foundModel=await getModel(dataId, ['announceSuggestion', 'application', 'report'])
    if (foundModel=='application') {
      await canRefuseApplication(dataId)
    }
    if (foundModel=='announceSuggestion') {
      const sugg=await AnnounceSuggestion.findById(dataId)
      if (!(sugg.status==ANNOUNCE_SUGGESTION_SENT)) {
        throw new ForbiddenError(`La suggestion ne peut être refusée`)
      }
    }
    if (foundModel=='report') {
      await canRefuseReport(dataId)
    }
  }

  if (action=='alle_finish_mission') {
    const mission=await Mission.findById(dataId)
    const role=user.role
    if (!idEqual(mission.freelance._id, user._id) && !idEqual(mission.customer._id, user._id)) {
      throw new ForbiddenError(`Vous n'avez pas de droit sur cette mission`)
    }
    if (role==ROLE_FREELANCE && mission.status!=MISSION_STATUS_CURRENT) {
      throw new ForbiddenError(`Vous ne pouvez terminer une mission dans l'état ${MISSION_STATUS[mission.status]}`)
    }
    if (role==ROLE_CUSTOMER && mission.status!=MISSION_STATUS_FREELANCE_FINISHED) {
      throw new ForbiddenError(`Vous ne pouvez terminer une mission dans l'état ${MISSION_STATUS[mission.status]}`)
    }
  }
  return true
}

setAllowActionFn(isActionAllowed)
