const axios = require('axios')
const crypto=require('crypto')
const { sendForgotPassword, sendNewMessage, sendAccountCreated, sendResetPassword } = require('./mailing')
const {
  DAYS_BEFORE_IND_CHALL_ANSWER,
  PARTICULAR_COMPANY_NAME,
  ROLE_CUSTOMER,
  ROLE_SUPPORT,
  CALL_STATUS_CALL_1,
  COACHING_STATUS_DROPPED,
  COACHING_STATUS_FINISHED,
  COACHING_STATUS_STOPPED,
  ROLE_EXTERNAL_DIET,
  ROLE_ADMIN,
  ROLE_SUPER_ADMIN,
  RESET_TOKEN_VALIDITY
} = require('./consts')
const {
  ensureChallengePipsConsistency,
  getRegisterCompany,
  canPatientStartCoaching
} = require('./functions')
const { generatePassword, validatePassword } = require('../../../utils/passwords')
const { importLeads } = require('./leads')
const Content = require('../../models/Content')
const Webinar = require('../../models/Webinar')

const { getHostName, getSmartdietAPIConfig, paymentPlugin } = require('../../../config/config')
const moment = require('moment')
const IndividualChallenge = require('../../models/IndividualChallenge')
const { BadRequestError, NotFoundError, ForbiddenError } = require('../../utils/errors')
const UserSurvey = require('../../models/UserSurvey')
const UserQuestion = require('../../models/UserQuestion')
const Question = require('../../models/Question')
const mongoose = require('mongoose')
const { getModel, idEqual, loadFromDb } = require('../../utils/database')
const { addAction, setAllowActionFn, ACTIONS } = require('../../utils/studio/actions')
const User = require('../../models/User')
const Group = require('../../models/Group')
const Pack = require('../../models/Pack')
const Company = require('../../models/Company')
const CollectiveChallenge = require('../../models/CollectiveChallenge')
const Team = require('../../models/Team')
const TeamMember = require('../../models/TeamMember')
const lodash = require('lodash')
const Lead = require('../../models/Lead')
const Conversation = require('../../models/Conversation')
const Appointment = require('../../models/Appointment')
const Coaching = require('../../models/Coaching')
const { sendBufferToAWS } = require('../../middlewares/aws')
const PageTag_ = require('../../models/PageTag_')
const Purchase = require('../../models/Purchase')
const { PURCHASE_STATUS_NEW, API_ROOT, PURCHASE_STATUS_PENDING } = require('../../../utils/consts')
const { upsertAccount } = require('../agenda/smartagenda')
const Quizz = require('../../models/Quizz')
const ResetToken = require('../../models/ResetToken')

const smartdiet_join_group = ({ value, join }, user) => {
  return Group.findByIdAndUpdate(value, join ? { $addToSet: { users: user._id } } : { $pull: { users: user._id } })
    .then(() => Group.findById(value))
    .then(g => g._id)
}

addAction('smartdiet_join_group', smartdiet_join_group)

// skip, join or pass
const smartdiet_event = action => ({ value }, user) => {
  return user.canJoinEvent(value)
    .then(() => getModel(value, ['webinar', 'individualChallenge', 'menu', 'collectiveChallenge']))
    .then(model => {
      const dbAction = action ==
        'smartdiet_skip_event' ? { $addToSet: { skipped_events: value }, $pull: { registered_events: { event: value }, passed_events: value } }
        : action == 'smartdiet_join_event' ? { $addToSet: { registered_events: { event: value } } }
          : action == 'smartdiet_pass_event' ? { $addToSet: { passed_events: value, registered_events: { event: value } } }
            : action == 'smartdiet_fail_event' ? { $addToSet: { failed_events: value, registered_events: { event: value } } }
              : action == 'smartdiet_routine_challenge' ? { $addToSet: { routine_events: value } }
                : action == 'smartdiet_replay_event' ? { $addToSet: { replayed_events: value } }
                  : null

      if (!dbAction) {
        throw new Error(`Event subaction ${JSON.stringify(action)} unknown`)
      }

      return User.findByIdAndUpdate(user._id, dbAction)
        .then(() => mongoose.models[model].findById(value))
    })
}

['smartdiet_join_event', 'smartdiet_skip_event', 'smartdiet_pass_event',
  'smartdiet_fail_event', 'smartdiet_routine_challenge', 'smartdiet_replay_event'].forEach(action => {
    addAction(action, smartdiet_event(action))
  })

const smartdietShiftChallenge = ({ value, join }, user) => {
  return IndividualChallenge.findByIdAndUpdate(value, { update_date: moment() })
}

addAction('smartdiet_shift_challenge', smartdietShiftChallenge)

const defaultRegister = ACTIONS.register

const register = async (props, user) => {
  // No compay => set the particular one
  if (!props.role) {
    props.role = ROLE_CUSTOMER
    console.log(`Setting role ${JSON.stringify(props.role)}`)
  }
  if (user?.role==ROLE_EXTERNAL_DIET && !props.password) {
    const password=generatePassword()
    props.password=password
    props.password2=password
  }
  // Check company code
  if (!props.role || props.role == ROLE_CUSTOMER) {
    return getRegisterCompany(props)
      .then(integrityProps => {
        if (!integrityProps.company) {
          return Company.findOne({ name: PARTICULAR_COMPANY_NAME })
            .then(company => ({ ...integrityProps, company: company._id }))
        }
        return integrityProps
      })
      .then(extraProps => defaultRegister({ ...props, ...extraProps }))
      .then(data => {
        User.findById(data._id).populate('company')
          .then(usr => {
            sendAccountCreated({user: usr, password: props.password})
            upsertAccount(lodash.pick(usr, ['email', 'firstname', 'lastname']))
              .then(id => User.findByIdAndUpdate(data._id, {smartagenda_id: id}))
              .catch(console.error)
          })
        return data
      })
  }
  return defaultRegister({ ...props })
}
addAction('register', register)

const setSmartdietCompanyCode = ({ code }, user) => {
  code = code ? code.replace(/ /g, '') : code
  if (!code?.trim()) {
    return User.findById(user._id)
  }
  return Company.findOne({ code: code })
    .then(company => {
      if (!company) { throw new BadRequestError(`Code entreprise ${code} invalide`) }
      return User.findByIdAndUpdate(user._id, { company_code: code, company })
    })
}
addAction('smartdiet_set_company_code', setSmartdietCompanyCode)

const smartdietStartSurvey = (_, user) => {
  return Question.find({}).sort({ order: 1 })
    .then(questions => {
      if (lodash.isEmpty(questions)) { throw new BadRequestError(`Aucun questionnaire n'est disponible`) }
      return UserSurvey.create({ user })
        .then(survey => Promise.all(questions.map(question => UserQuestion.create({ user, survey, question, order: question.order }))))
        .then(questions => lodash.minBy(questions, 'question.order'))
    })
}
addAction('smartdiet_start_survey', smartdietStartSurvey)

const smartdietNextQuestion = ({ value }, user) => {
  return UserQuestion.findById(value).populate('question')
    .then(question => UserQuestion.find({ survey: question.survey, order: { $gt: question.order } }).sort({ order: 1 }))
    .then(questions => questions[0])
}
addAction('smartdiet_next_question', smartdietNextQuestion)

const smartdietFinishSurvey = ({ value }, user) => {
  return UserQuestion.findById(value).populate('question')
    .then(question => UserQuestion.exists({ survey: question.survey, order: question.order + 1 }))
    .then(exists => {
      if (exists) { throw new BadRequestError(`Le questionnaire n'est pas terminé`) }
      return loadFromDb({ model: 'user', id: user._id, fields: ['latest_coachings'], user })
        .then(users => {
          const res = users[0]?.latest_coachings?.[0]
          return res
        })
    })
}
addAction('smartdiet_finish_survey', smartdietFinishSurvey)

const smartdietJoinTeam = ({ value }, user) => {
  return isActionAllowed({ action: 'smartdiet_join_team', dataId: value, user })
    .then(allowed => {
      if (!allowed) throw new BadRequestError(`Vous appartenez déjà à une équipe`)
      return TeamMember.create({ team: value, user })
        .then(member => {
          ensureChallengePipsConsistency()
          return member
        })
    })
}
addAction('smartdiet_join_team', smartdietJoinTeam)

const smartdietLeaveTeam = ({ value }, user) => {
  return isActionAllowed({ action: 'smartdiet_leave_team', dataId: value, user })
    .then(allowed => {
      if (!allowed) throw new BadRequestError(`Vous n'appartenez pas à cette équipe`)
      return TeamMember.remove({ team: value, user })
    })
}
addAction('smartdiet_leave_team', smartdietLeaveTeam)

const smartdietFindTeamMember = ({ value }, user) => {
  return TeamMember.find({ user }).populate('team')
    .then(members => members.find(m => idEqual(m.team.collectiveChallenge._id, value)))
    .then(member => {
      if (!member) {
        throw new NotFoundError(`Vous n'êtes pas membre de ce challenge, rejoignez une équipe!`)
      }
      return member
    })
}

addAction('smartdiet_find_team_member', smartdietFindTeamMember)

const smartdietOpenTeamPage = ({ value, page }, user) => {
  console.log(`Find team for ${value} then open page ${page}`)
  return TeamMember.find({ user }).populate('team')
    .then(members => members.find(m => idEqual(m.team.collectiveChallenge._id, value)))
    .then(member => {
      if (!member) {
        throw new NotFoundError(`Vous n'êtes pas membre de ce challenge, rejoignez une équipe!`)
      }
      const redirect = `https://${getHostName()}/${page}?id=${member._id}`
      return { redirect, ...member }
    })
}
addAction('smartdiet_open_team_page', smartdietOpenTeamPage)

const smartdietReadContent = ({ value }, user) => {
  return isActionAllowed({ action: 'smartdiet_read_content', dataId: value, user })
    .then(allowed => {
      if (!allowed) throw new BadRequestError(`Vous ne pouvez accéder à ce contenu`)
      return Content.findByIdAndUpdate(value, { $addToSet: { viewed_by: user._id } })
    })
}
addAction('smartdiet_read_content', smartdietReadContent)

const importModelData = ({ model, data }) => {
  if (model != 'lead') {
    throw new NotFoundError(`L'import du modèle ${model} n'est pas implémenté`)
  }
  return importLeads(data)
}
addAction('import_model_data', importModelData)

const forgotPasswordAction = async ({ context, parent, email }) => {
  return User.findOne({ email })
    .then(async user => {
      if (!user) {
        throw new BadRequestError(`Aucun compte n'est associé à cet email`)
      }
      if (user.reset_token) {
        await ResetToken.findByIdAndDelete(user.reset_token)
      }
      const token = await ResetToken.create({})
      user.reset_token = token
      return user.save()
        .then(user => sendResetPassword({ user, duration: RESET_TOKEN_VALIDITY, token: token.token}))
        .then(user => `Un email a été envoyé à l'adresse ${email}`)
    })
}
addAction('forgotPassword', forgotPasswordAction)

const deactivateAccount = ({ value, reason }, user) => {
  console.log(`Value is ${value}`)
  return isActionAllowed({ action: 'deactivateAccount', dataId: value?._id, user })
    .then(ok => {
      if (!ok) { return false }
      return User.findByIdAndUpdate(
        value._id,
        { active: false }
      )
    })
}
addAction('deactivateAccount', deactivateAccount)

const affectLead = ({ value }, user) => {
  return isActionAllowed({ action: 'smartdiet_affect_lead', dataId: value, user })
    .then(ok => ok && Lead.findByIdAndUpdate(
        value,{ 
          $set: {operator: user._id, call_status: CALL_STATUS_CALL_1, call_date: moment()}, 
          $push: {_call_status_history: {date: moment(), call_status: CALL_STATUS_CALL_1}}
        })
    )
}

addAction('smartdiet_affect_lead', affectLead)

// Override sendMessage for notification
const orgSendMessage = ACTIONS.sendMessage

const sendMessageOverride = (params, sender) => {
  // destinee may be a user or a conversation
  return Conversation.findById(params.destinee)
    .then(conv => {
      // destinee id was a conversation
      if (conv) {
        return conv.getPartner(sender._id)
          .then(partner => {
            params.destinee=partner._id
            return conv
          })
      }
      else {
        return Conversation.getFromUsers(sender._id, params.destinee)
      }
    })
    .then(conv => {
      return orgSendMessage({...params, conversation: conv._id}, sender)
      .then(message => {
        sendNewMessage({ user: message.receiver })
        return message
      })
      })
}
addAction('sendMessage', sendMessageOverride)

const setRabbitAppointment = ({value}, sender) => {
  return Appointment.findByIdAndUpdate(value, {validated: false})
}
addAction('smartdiet_rabbit_appointment', setRabbitAppointment)

const downloadSmartdietDocument = ({type, patientId, documentId}) => {

  const config=getSmartdietAPIConfig()
  const url = 'https://pro.smartdiet.fr/ws/patient-summary'
  const timestamp=moment().unix()
  const hashStr=`${documentId}${timestamp}${config.login}:${config.password}`
  const hash=crypto.createHash('md5').update(hashStr).digest('hex')

  const postData = {
    resourceType: type,
    patientId: patientId, 
    summaryId: documentId,
    timestamp,
    hash
  };

  const headers={'Content-Type': 'application/json'}

  console.log('url', url, 'post data',postData, 'timestamp', timestamp, 'hash str', hashStr, 'hash', hash)

  return axios.post(url, postData, {headers})
  .then(({data}) => Buffer.from(data, 'base64'))
}


const downloadAssessment = async ({value}, sender) => {
  const coaching=await Coaching.findById(value).populate('user')
  const buffer=await downloadSmartdietDocument({type: 'summary', patientId: coaching.smartdiet_patient_id, documentId: coaching.smartdiet_assessment_id})

  const s3File=await sendBufferToAWS({filename: `checkup_${coaching._id}.pdf`, buffer, type: 'document', mimeType: 'application/pdf', })
  console.log('got file', s3File?.Location)
  return Coaching.findByIdAndUpdate(value, {smartdiet_assessment_document: s3File?.Location}, {runValidators: true, new: true}).catch(console.error)
}
addAction('smartdiet_download_assessment', downloadAssessment)

const downloadImpact = async ({value}, sender) => {
  const coaching=await Coaching.findById(value).populate('user')
  const buffer=await downloadSmartdietDocument({type: 'secondsummary', patientId: coaching.smartdiet_patient_id, documentId: coaching.smartdiet_impact_id})

  const s3File=await sendBufferToAWS({filename: `impact_${coaching._id}.pdf`, buffer, type: 'document', mimeType: 'application/pdf', })
  console.log('got file', s3File?.Location)
  return Coaching.findByIdAndUpdate(value, {smartdiet_impact_document: s3File?.Location}, {runValidators: true, new: true}).catch(console.error)
}
addAction('smartdiet_download_impact', downloadImpact)

const buyPack = async ({value}, sender) => {
  await isActionAllowed({action:'smartdiet_buy_pack', dataId:value, user:sender})
  // If no value, generic "OK" return
  if (lodash.isEmpty(value)) {
    return {}
  }
  // No pack provided: the user can buy at leaast one pack
  const model=await getModel(value)
  if (model!='pack') {
    return true
  }
  const pack=(await loadFromDb({model: 'pack', id: value, fields:['discount_price', 'payment_count', 'stripe_id'], user: sender}))[0]  
  const purchase=await Purchase.create({customer: sender, pack})
  const success_url=`https://${getHostName()}${API_ROOT}payment-hook?checkout_id={CHECKOUT_SESSION_ID}&success=true`

  // To update purchase.external_id
  const payment_promise=pack.payment_count>1 ? paymentPlugin.createRecurrentPayment : paymentPlugin.createSinglePayment
  return payment_promise({
    amount: pack.discount_price, 
    customer_email: sender.email,
    product_stripe_id: pack.stripe_id,
    success_url: success_url, 
    internal_reference: purchase._id.toString(),
  })
    .then(async payment => {
      purchase.external_id=payment.id
      purchase.status=PURCHASE_STATUS_PENDING
      await purchase.save()
      return {redirect: payment.url}
    })
}
addAction('smartdiet_buy_pack', buyPack)

const validateAction = async ({value}, sender) => {
  return Appointment.findByIdAndUpdate(value, {validated: true})
}
addAction('validate', validateAction)

const resetAssessment = async ({value}, sender) => {
  console.log('Reset assessment quizz for coaching', value)
  const coaching=await Coaching.findById(value)
    .populate({path:'offer', populate: {path: 'assessment_quizz', populate: 'questions'}})
  const clonedQuizz=await coaching.offer.assessment_quizz.cloneAsUserQuizz()
  const prevQuizz=coaching.assessment_quizz
  coaching.assessment_quizz=clonedQuizz._id  
  await coaching.save()
  if (prevQuizz) {
    await Quizz.findByIdAndDelete(prevQuizz)
  }
}
addAction('sm_reset_assessment', resetAssessment)

const changePasswordAction = async ({value, password, password2}) => {
  const token=await ResetToken.findById(value)
  if (!token || moment().isAfter(token.valid_until)) {
    console.warn(`Invalid token`, token)
    throw new BadRequestError(`Le token est invalide`)
  }
  const user=await User.findOne({reset_token: value})
  if (!user) {
    console.warn(`No user for`, token)
    throw new BadRequestError(`Le token est invalide`)
  }
  await validatePassword({password, password2})
  user.password=password
  const res=user.save()
  await ResetToken.findByIdAndDelete(user.reset_token)
  return res
}
addAction('changePassword', changePasswordAction)

const isActionAllowed = async ({ action, dataId, user, actionProps }) => {
  // Handle fast actions
  if (action == 'openPage' || action == 'previous') {
    return true
  }
  if (action == 'smartdiet_buy_pack') {
    const [loadedUser]=await loadFromDb({model: 'user', id: user._id, user, fields: ['can_buy_pack', 'latest_coachings']})
    // If no value provided, generic authorization
    const pack=await Pack.findById(dataId)
    // if (lodash.isEmpty(dataId) || dataId==='undefined') {
    if (!pack) {
      return loadedUser.can_buy_pack 
    }
    return loadedUser.can_buy_pack && (!lodash.isEmpty(loadedUser.latest_coachings) || pack.checkup)
  }
  if (action == 'smartdiet_download_assessment' || action == 'smartdiet_download_impact') {
    const attributePrefix= action == 'smartdiet_download_assessment' ? 'smartdiet_assessment': 'smartdiet_impact'
    const idAttribute=`${attributePrefix}_id`
    const documentAttribute=`${attributePrefix}_document`
    return Coaching.exists({_id: dataId, [idAttribute]: {$ne:null}, [documentAttribute]: null})
  }
  if (action == 'logout') {
    return Promise.resolve(!!user)
  }
  if (action == 'smartdiet_affect_lead') {
    if (![ROLE_EXTERNAL_DIET, ROLE_SUPPORT].includes(user.role)) {
      return Promise.reject(`Seul le support ou la diet peut s'affecter des prospects`)
    }
    return Lead.exists({_id: dataId, operator: null})
  }
  // Can i start a new coaching ?
  // TODO: send nothing instead of "undefined" for dataId
  if (action=='create' && actionProps.model=='nutritionAdvice') {
    if (!(user.role==ROLE_EXTERNAL_DIET)) {
      throw new Error(`Seule une diet peut créer un conseil nut`)
    }
  }
  if (['save', 'create'].includes(action) && actionProps?.model=='coaching' && (action=='create' || (lodash.isEmpty(dataId) || dataId=="undefined"))) {
    let patientId;
    if ([ROLE_ADMIN, ROLE_SUPER_ADMIN, ROLE_SUPPORT, ROLE_EXTERNAL_DIET].includes(user.role)) {
      if (!actionProps?.parent) {
        throw new Error(`Vous devez sélectionner le patient qui démarre un coaching`)    
      }
      return true
    }
    else if (user.role==ROLE_CUSTOMER) {
      patientId=user._id
    }
    else {
      console.error(`Rôle ${user.role} sans droit à coaching`)
      throw new Error(`Vous n'êtes pas autorisé à démarrer un coaching`)    
    }

    // Must customer
    return canPatientStartCoaching(patientId, user)
      .then(res => !!res)
  }

  if (['save', 'create'].includes(action) && ['ticket', 'ticketComment'].includes(actionProps?.model)) {
    if (user?.role!= ROLE_EXTERNAL_DIET) {
      throw new ForbiddenError(`Vous devez être diet pour créer ou modifier un ticket`)
    }
    return true
  }

  if (action=='create' && actionProps?.model=='appointment') {
    return true
  } 

  if (action=='validate') {
    if (!(await Appointment.exists({_id: dataId}))) {
      throw new NotFoundError(`Rendez-vous ${value} introuvable`)
    }
  }

  if (action=='sm_reset_assessment') {
    const coaching=await Coaching.findById(dataId).populate('offer').populate({path: 'appointments', })
    if (!coaching?.offer?.assessment_quizz) {
      throw new NotFoundError(`Bilan introuvable pour ce coaching`)
    }
  }
  const promise = dataId && dataId != "undefined" ? getModel(dataId) : Promise.resolve(null)
  return promise
    .then(modelName => {
      const promise=modelName ? mongoose.models[modelName].findById(dataId) : Promise.resolve(null)
      return promise
        .then(data => {
          if (action == 'smartdiet_join_event') {
            /**
            TODO perfs
            return loadFromDb({model: 'user', id:user._id, fields:['failed_events', 'skipped_events',  'registered_events', 'passed_events', 'webinars'], user})
            .then(([user]) => {
              */
            return User.findById(user._id).populate(['failed_events', 'skipped_events', 'registered_events', 'passed_events', 'routine_events', 'webinars'])
              .then(user => {
                // Indiv. challege before start_date: false
                if (modelName == 'individualChallenge' && moment().isBefore(data.start_date)) {
                  return false
                }
                if (user?.skipped_events?.some(r => idEqual(r._id, dataId))) { return false }
                if (user?.registered_events?.some(r => idEqual(r.event._id, dataId))) {
                  return ['collectiveChallenge', 'menu'].includes(modelName)
                }
                if (user?.passed_events?.some(r => idEqual(r._id, dataId))) { return false }
                if (user?.failed_events?.some(r => idEqual(r._id, dataId))) { return false }
                return true
              })
          }
          if (action == 'smartdiet_skip_event') {
            // Indiv. challege before start_date: false
            if (modelName == 'individualChallenge' && moment().isBefore(data.start_date)) {
              return false
            }
            /**
            TODO perfs
            return loadFromDb({model: 'user', id:user._id, fields:['failed_events', 'skipped_events',  'registered_events', 'passed_events', 'webinars'], user})
            .then(([user]) => {
              */
            return User.findById(user._id).populate(['failed_events', 'skipped_events', 'registered_events', 'passed_events', 'routine_events', 'webinars'])
              .then(user => {
                if (modelName == 'menu') { return false }
                if (user?.skipped_events?.some(r => idEqual(r._id, dataId))) { return false }
                if (user?.registered_events?.some(r => idEqual(r.event._id, dataId))) { return false }
                if (user?.passed_events?.some(r => idEqual(r._id, dataId))) { return false }
                if (user?.failed_events?.some(r => idEqual(r._id, dataId))) { return false }
                return true
              })
          }
          if (action == 'smartdiet_pass_event') {
            /**
            TODO perfs
            return loadFromDb({model: 'user', id:user._id, fields:['failed_events', 'skipped_events',  'registered_events', 'passed_events', 'webinars'], user})
            .then(([user]) => {
              */
            return User.findById(user._id).populate(['failed_events', 'skipped_events', 'registered_events', 'passed_events', 'routine_events', 'webinars'])
              .then(user => {
                if (modelName == 'menu') { return false }
                if (user?.skipped_events?.some(r => idEqual(r._id, dataId))) { return false }
                if (user?.routine_events?.some(r => idEqual(r._id, dataId))) { return false }
                if (modelName!='webinar' && user?.passed_events?.some(r => idEqual(r._id, dataId))) { return false }
                const registeredEvent = user?.registered_events?.find(r => idEqual(r.event._id, dataId))
                // Event must be registered except for past webinars
                if (modelName == 'webinar') {
                  return Webinar.findById(dataId)
                    .then(webinar => !!registeredEvent || moment(webinar.end_date).isBefore(moment()))
                }
                /// Ind. chall can be passed or failed 7 days after registration
                else if (modelName == 'individualChallenge') {
                  return moment().diff(registeredEvent?.date, 'days') >= DAYS_BEFORE_IND_CHALL_ANSWER
                }
                else {
                  return !!registeredEvent
                }
              })
          }
          if (action == 'smartdiet_routine_challenge') {
            // Indiv. challege before start_date: false
            if (modelName == 'individualChallenge' && moment().isBefore(data.start_date)) {
              return false
            }
            /**
            TODO perfs
            return loadFromDb({model: 'user', id:user._id, fields:['failed_events', 'skipped_events',  'registered_events', 'passed_events', 'webinars'], user})
            .then(([user]) => {
              */
            return User.findById(user._id).populate(['failed_events', 'skipped_events', 'registered_events', 'passed_events', 'routine_events', 'webinars'])
              .then(user => {
                if (modelName != 'individualChallenge') { return false }
                if (user?.registered_events?.some(r => idEqual(r.event._id, dataId))) { return false }
                if (user?.passed_events?.some(r => idEqual(r._id, dataId))) { return false }
                if (user?.skipped_events?.some(r => idEqual(r._id, dataId))) { return false }
                if (user?.routine_events?.some(r => idEqual(r._id, dataId))) { return false }
                return true
              })
          }
          if (action == 'smartdiet_fail_event') {
            /**
            TODO perfs
            return loadFromDb({model: 'user', id:user._id, fields:['failed_events', 'skipped_events',  'registered_events', 'passed_events', 'webinars'], user})
            .then(([user]) => {
              */
            return User.findById(user._id).populate(['failed_events', 'skipped_events', 'registered_events', 'passed_events', 'routine_events', 'webinars'])
              .then(user => {
                if (modelName == 'menu') { return false }
                if (modelName == 'webinar') { return false }
                if (user?.passed_events?.some(r => idEqual(r._id, dataId))) { return false }
                if (user?.skipped_events?.some(r => idEqual(r._id, dataId))) { return false }
                if (!user?.registered_events?.some(r => idEqual(r.event._id, dataId))) { return false }
                const registeredEvent = user?.registered_events?.find(r => idEqual(r.event._id, dataId))
                /// Ind. chall can be passed or failed 7 days after registration
                if (modelName == 'individualChallenge') {
                  return moment().diff(registeredEvent?.date, 'days') >= DAYS_BEFORE_IND_CHALL_ANSWER
                }
                return true
              })
          }
          if (action == 'smartdiet_next_question') {
            return UserQuestion.findById(dataId).populate('survey')
              .then(question => {
                // Not answered question: no next
                if (lodash.isNil(question.answer)) { return false }
                return UserQuestion.exists({ survey: question.survey, order: { $gt: question.order } })
              })
          }
          if (action == 'smartdiet_finish_survey') {
            return UserQuestion.findById(dataId).populate('survey')
              .then(question => Promise.all([
                UserQuestion.exists({ survey: question.survey, order: { $gt: question.order } }),
                Promise.resolve(!lodash.isNil(question.answer))
              ]))
              .then(([exists, answered]) => !exists && answered)
          }
          if (action == 'smartdiet_join_team') {
            // Get all teams of this team's collective challenge, then check if
            // user in on one of them
            return Team.findById(dataId, 'collectiveChallenge').populate({ path: 'collectiveChallenge', populate: { path: 'teams', populate: 'members' } })
              .then(team => team.collectiveChallenge)
              .then(challenge => {
                // Challenge not started yet
                return moment(challenge.start_date).isAfter(moment())
                  // Not already in a team
                  && !challenge.teams.some(t => t.members.some(m => idEqual(m.user._id, user._id)))
              })
          }
          if (action == 'smartdiet_leave_team') {
            // Check if I belong to this team
            return TeamMember.exists({ team: dataId, user: user._id })
          }
          if (action == 'smartdiet_shift_challenge') {
            // Get all teams of this team's collective challenge, then check if
            // user in on one of them
            return loadFromDb({ model: 'user', id: user._id, fields: ['current_individual_challenge', '_all_individual_challenges', 'passed_events', 'failed_events'], user })
              .then(([user]) => !user.current_individual_challenge)
          }
          if (action == 'smartdiet_read_content') {
            // Get all teams of this team's collective challenge, then check if
            // user in on one of them
            return user.canView(dataId)
          }
          if (action == 'smartdiet_rabbit_appointment') {
            return Appointment.exists({_id: dataId, validated: {$in: [null, undefined]}, end_date: {$lt: moment()}})
          }
          return Promise.resolve(true)
        })
        .catch(console.error)
    })
}

setAllowActionFn(isActionAllowed)

