const axios=require('axios')
const {
  declareComputedField,
  declareEnumField,
  declareVirtualField,
  differenceSet,
  getModel,
  idEqual,
  loadFromDb,
  setFilterDataUser,
  setImportDataFunction,
  setIntersects,
  setPostCreateData,
  setPostDeleteData,
  setPostPutData,
  setPreCreateData,
  setPreprocessGet,
  simpleCloneModel,
  getDateFilter,
  setPrePutData,
  createSearchFilter,
} = require('../../utils/database')
const {
  sendDietPreRegister2Admin,
  sendDietPreRegister2Diet,
  sendInactivity15,
  sendInactivity30,
  sendInactivity45,
  sendIndChallenge1,
  sendIndChallenge2,
  sendIndChallenge3,
  sendIndChallenge5,
  sendIndChallenge6,
  sendNewWebinar,
  sendSaturday1,
  sendSaturday2,
  sendSaturday3,
  sendSaturday4,
  sendWebinarIn3Days,
  sendWebinarJ15,
  sendWebinarJ,
  sendWebinarJ21,
  sendAppointmentRemindTomorrow,
  sendAppointmentNotValidated,
  sendWebinarDayAfter,
} = require('./mailing')
const { formatDateTime } = require('../../../utils/text')
const Webinar = require('../../models/Webinar')
require('../../models/Target')
require('../../models/UserQuizz')
require('../../models/Key')
require('../../models/Association')
require('../../models/Item')
require('../../models/Question')
const Pack=require('../../models/Pack')
const Ticket=require('../../models/Ticket')
const TicketComment=require('../../models/TicketComment')
const { updateWorkflows } = require('./workflows')
const {
  ACTIVITY,
  ANSWER_STATUS,
  APPOINTMENT_CURRENT,
  APPOINTMENT_PAST,
  APPOINTMENT_STATUS,
  APPOINTMENT_TO_COME,
  COACHING_MODE,
  COACHING_QUESTION_STATUS,
  COMPANY_ACTIVITY,
  COMPANY_ACTIVITY_SERVICES_AUX_ENTREPRISES,
  CONTENTS_TYPE,
  DAYS,
  DIET_ACTIVITIES,
  DIET_REGISTRATION_STATUS,
  ECOSCORE,
  EVENT_TYPE,
  EVENT_WEBINAR,
  FOOD_DOCUMENT_TYPE,
  GENDER,
  GENDER_FEMALE,
  GENDER_MALE,
  GENDER_NON_BINARY,
  GROUPS_CREDIT,
  HARDNESS,
  HOME_STATUS,
  MEAL_POSITION,
  NUTRISCORE,
  PARTICULAR_COMPANY_NAME,
  PERIOD,
  QUIZZ_QUESTION_TYPE,
  QUIZZ_TYPE,
  QUIZZ_TYPE_LOGBOOK,
  QUIZZ_TYPE_PROGRESS,
  REGISTRATION_WARNING,
  REGISTRATION_WARNING_CODE_MISSING,
  REGISTRATION_WARNING_LEAD_MISSING,
  ROLES,
  ROLE_ADMIN,
  ROLE_CUSTOMER,
  ROLE_EXTERNAL_DIET,
  ROLE_RH,
  ROLE_SUPER_ADMIN,
  SEASON,
  SPOON_SOURCE,
  SURVEY_ANSWER,
  TARGET_COACHING,
  TARGET_SPECIFICITY,
  TARGET_TYPE,
  UNIT,
  MENU_PEOPLE_COUNT,
  convertQuantity,
  CALL_STATUS,
  CALL_DIRECTION,
  ROLE_SUPPORT,
  COACHING_CONVERSION_STATUS,
  COACHING_CONVERSION_TO_COME,
  COACHING_CONVERSION_CANCELLED,
  COACHING_CONVERSION_CONVERTED,
  RECIPE_TYPE,
  APPOINTMENT_TYPE_ASSESSMENT,
  APPOINTMENT_TYPE_FOLLOWUP,
  COACHING_STATUS,
  QUIZZ_TYPE_ASSESSMENT,
  TICKET_PRIORITY,
  COACHING_STATUS_DROPPED,
  COACHING_STATUS_FINISHED,
  COACHING_STATUS_STOPPED,
  COACHING_STATUS_NOT_STARTED,
  APPOINTMENT_VALID,
  COACHING_STATUS_STARTED,
  CALL_DIRECTION_IN_CALL,
  CALL_DIRECTION_OUT_CALL,
  SOURCE,
  AVAILABILITIES_RANGE_DAYS,
  CALL_STATUS_CONVERTI_COA,
  CALL_STATUS_CONVERTI_COA_CN,
  CALL_STATUS_CONVERTI_CN,
  LEAD_SEARCH_TEXT_FIELDS,
  USER_SEARCH_TEXT_FIELDS,
  CONTENT_VISIBILITY,
  CONTENT_ARTICLE,
  SOURCE_SMARTAGENDA
} = require('./consts')
const {
  HOOK_DELETE,
  HOOK_INSERT,
  HOOK_UPDATE,
  createAppointment,
  deleteAppointment,
  getAccount,
  getAgenda,
  getAppointmentTypes,
  getAppointmentVisioLink,
  upsertAccount,
  getAvailabilities
} = require('../agenda/smartagenda')

const Category = require('../../models/Category')
const { delayPromise, runPromisesWithDelay } = require('../../utils/concurrency')
const {getSmartAgendaConfig, isDevelopment} = require('../../../config/config')
const AppointmentType = require('../../models/AppointmentType')
require('../../models/LogbookDay')
const { importLeads, getCompanyLeads } = require('./leads')
const Quizz = require('../../models/Quizz')
const CoachingLogbook = require('../../models/CoachingLogbook')
const {
  CREATED_AT_ATTRIBUTE,
  UPDATED_AT_ATTRIBUTE,
  PURCHASE_STATUS
} = require('../../../utils/consts')
const UserQuizzQuestion = require('../../models/UserQuizzQuestion')
const QuizzQuestion = require('../../models/QuizzQuestion')
const { BadRequestError, ForbiddenError, NotFoundError } = require('../../utils/errors')
const SpoonGain = require('../../models/SpoonGain')
const CoachingQuestion = require('../../models/CoachingQuestion')
const CollectiveChallenge = require('../../models/CollectiveChallenge')
const Pip = require('../../models/Pip')
const ChallengeUserPip = require('../../models/ChallengeUserPip')
const ChallengeUserPipSchema = require('./schemas/ChallengeUserPipSchema')
const ChallengePip = require('../../models/ChallengePip')
const {
  getUserIndChallengeTrophy,
  getUserKeyProgress,
  getUserKeySpoons,
  getUserKeyTrophy,
  getUserKeyReadContents,
  getUserSpoons,
  getObtainedTrophy
} = require('./spoons')
const mongoose = require('mongoose')
require('lodash.product')
const lodash = require('lodash')
const moment = require('moment')
const UserSurvey = require('../../models/UserSurvey')
const Offer = require('../../models/Offer')
const Content = require('../../models/Content')
const Company = require('../../models/Company')
const User = require('../../models/User')
const Team = require('../../models/Team')
const JoinReason = require('../../models/JoinReason')
const DeclineReason = require('../../models/DeclineReason')
const TeamMember = require('../../models/TeamMember')
const Coaching = require('../../models/Coaching')
const Appointment = require('../../models/Appointment')
const Message = require('../../models/Message')
const Lead = require('../../models/Lead')
const cron = require('../../utils/cron')
const Group = require('../../models/Group')
const Conversation = require('../../models/Conversation')
const UserQuizz = require('../../models/UserQuizz')
const { computeBilling } = require('./billing')
const { isPhoneOk, PHONE_REGEX } = require('../../../utils/sms')
const { updateCoachingStatus, getAvailableDiets, getDietAvailabilities} = require('./coaching')
const { tokenize } = require('protobufjs')
const LogbookDay = require('../../models/LogbookDay')
const { createTicket, getTickets, createComment } = require('./ticketing')
const { PAYMENT_STATUS } = require('../fumoir/consts')
const Purchase = require('../../models/Purchase')
const { upsertProduct } = require('../payment/stripe')
const Job = require('../../models/Job')
const kpi = require('./kpi')
const { getNutAdviceCertificate, getAssessmentCertificate, getFinalCertificate } = require('./certificate')
const { validatePassword } = require('../../../utils/passwords')
const { createAppointmentProgress } = require('./quizz')
const { registerPreSave } = require('../../utils/schemas')
const { crmUpsertAccount } = require('../../utils/crm')
const NutritionAdvice = require('../../models/NutritionAdvice')
const ResetToken = require('../../models/ResetToken')


const filterDataUser = async ({ model, data, id, user, params }) => {
  if (model == 'offer' && !id) {
    return Offer.find({ company: null })
      .then(offers => data.filter(d => offers.some(o => idEqual(d._id, o._id))))
  }
  if (model == 'user' && user?.role == ROLE_RH) {
    data = data.filter(u => idEqual(id, user._id) || (user.company && idEqual(u.company?._id, user.company?._id)))
  }
  if (model == 'user') {
    if (params['sort.logbooks.day']) {
      data=data.map(d => ({
        ...d,
        logbooks: lodash.orderBy(d.logbooks, 'day', params['sort.logbooks.day']=='desc' ? 'desc' : 'asc'),
      }))
    }
    const pageIndex=parseInt(params['page.logbooks']) || 0
    const pageSize=parseInt(params['limit.logbooks']) || 0
    if (pageSize) {
      data=data.map(d => ({
        ...d,
        logbooks: d.logbooks.slice(pageIndex*pageSize, (pageIndex+1)*pageSize+1),
      }))
    }
  }
  // Filter leads for RH
  if (model == 'lead' && user?.role == ROLE_RH) {
    return User.findById(user?.id).populate('company')
      .then(user => {
        return data.filter(d => d.company_code == user?.company?.code)
      })
  }
  // Return not affected leads or affected to me
  if (model == 'lead' && user?.role == ROLE_SUPPORT) {
    return data.filter(lead => lodash.isNil(lead.operator) || idEqual(lead.operator._id, user._id))
  }
  // TODO Do not sort anymore to not confuse pagination
  // data = lodash.sortBy(data, ['order', 'fullname', 'name', 'label'])
  if (model=='pack' && user?.role==ROLE_CUSTOMER) {
    const [loadedUser]=await loadFromDb({model: 'user',id: user._id, fields: ['can_buy_pack', 'latest_coachings'], user})
    // If can not buy, return empty
    if (!loadedUser.can_buy_pack) {
      return []
    }
    // If user has no coaching, can not buy pack containing no checkup
    if (lodash.isEmpty(loadedUser.latest_coachings)) {
      const checkupPacks=await Pack.find({checkup: true})
      return data.filter(pack => checkupPacks.some(cp => cp._id.toString()==pack._id.toString()))
    }
  }

  return data
}

setFilterDataUser(filterDataUser)

const preProcessGet = async ({ model, fields, id, user, params }) => {
  // TODO Totally ugly. When asked for chartPoint, the studio should also require 'date' attribute => to fix in the studio
  const chartPointField=fields.find(v => /value_1/.test(v))
  if (chartPointField) {
    fields=[...fields, chartPointField.replace(/value_1/, 'date')]
  }

  if (model=='ticket') {
    return getTickets(user?.email)
      .then(tickets => tickets.map(t => ({...t, _id: t.jiraid})))
      .then(tickets => ({ model, fields, id, data: tickets}))
  }

  if (model === 'company') {
    if (params.registration_integrity === null) {
      params.registration_integrity = false;
    }
  }

  if (model === 'company' && !id && user.role==ROLE_RH) {
    const company=await Company.findById(user.company._id).populate('children')
    const ids=[company._id, ...company.children.map(c => c._id)]
    params['filter._id']={$in: ids}
  }

  if (model == 'loggedUser') {
    model = 'user'
    id = user?._id || 'INVALIDID'
  }

  if (model == 'user') {
    fields.push('company')
  }

  if (model == ROLE_CUSTOMER) {
    if (user.role==ROLE_EXTERNAL_DIET) {
      return Coaching.distinct('user', {diet: user._id})
        .then(ids => ({model, fields, id, user, 
          params: {...params, 'filter._id': {$in: ids}}
        }))
    }
  }

  if (['appointment', 'currentFutureAppointment', 'pastAppointment'] .includes(model)) {
    if (user.role==ROLE_EXTERNAL_DIET) {
      params['filter.diet']=user._id
    }
    else if (user.role==ROLE_CUSTOMER) {
      params['filter.user']=user._id
    }
    if (model=='currentFutureAppointment') {
      params['filter.end_date']={$gte: moment()}
    }
    if (model=='pastAppointment') {
      params['filter.end_date']={$lt: moment()}
    }
    return Promise.resolve({model: 'appointment', fields, id, user, params})
  }

  if (model == 'adminDashboard') {
    if (![ROLE_SUPER_ADMIN, ROLE_ADMIN, ROLE_RH].includes(user.role)) {
      return Promise.resolve({ model, fields, id, params, data: [] })
    }
    let company = params['filter.company'] ? params['filter.company'] : params.company
    const diet = params['filter.diet'] ? params['filter.diet'] : undefined
    const start_date = params['filter.start_date'] ? params['filter.start_date'] : undefined
    const end_date = params['filter.end_date'] ? params['filter.end_date'] : undefined
    if (!company && user.role==ROLE_RH) {
      company=user.company
    }
    return computeStatistics({ fields, company, start_date, end_date, diet})
      .then(stats => ({ model, fields, params, data: [stats] }))
  }

  if (model=='billing') {
    let diet
    const role = user.role
    if(role == ROLE_ADMIN || role == ROLE_SUPER_ADMIN){
      diet = id
    }
    else if(role == ROLE_EXTERNAL_DIET) {
      diet = user
    }
    else {
      throw new ForbiddenError(`La facturation n'est accessible qu'aux diets`)
    }
    return computeBilling({diet, fields, params, user })
  }

  if (model == 'conversation') {
    // Conversation id is the conversatio nid OR the other's one id
    if (id) {
      return Conversation.findById(id)
        .then(conv => {
          const res=conv || Conversation.getFromUsers(user._id, id)
          return res
        })
        .then(conv => {
          return {model, fields, id: conv._id, params }
        })
    }
    else {
      params['filter.users']=user._id
    }
  }

  if (model=='patient') {
    if (user.role==ROLE_EXTERNAL_DIET) {
      return Coaching.distinct('user', {diet: user._id})
        .then(ids => {
          console.log(`Got ${ids.length} patients`)
          params['filter._id']={$in: ids}
          return ({ model:'user', params, fields, id, user })
        })
    }
  }

  if (model=='diet') {
    params['filter.role']=ROLE_EXTERNAL_DIET
    model='user'
  }

  if (model=='logbookDay') {
    // Get by date
    const coachingLogbbokFields=[...fields.map(f => f.replace(/logbooks/, 'logbook')), 'day']
    const m=moment.unix(id)
    if (!!id && m.isValid()) {
      params=lodash(params).mapKeys((v, k) => k.replace(/logbooks/, 'logbook'))
	    .omitBy((v, k) => /limit/i.test(k))
	    .value()
      params={...params, 'filter.user': user._id}
      let coachingLogbooks=await loadFromDb({
        model: 'coachingLogbook', fields: coachingLogbbokFields, id: undefined, user, params
      })
      coachingLogbooks=coachingLogbooks.filter(l => moment(l.day).isSame(m, 'day'))
      const logbookDay={day: m.startOf('day'), logbooks: coachingLogbooks.map(c => c.logbook)}
      return {data: [logbookDay]}
   }
  }

  // Check ResetToken
  if (model=='resetToken') {
    const t=await ResetToken.findOne({token: id})
    if (!t || moment().isAfter(t.valid_until)) {
      console.warn(`Invalid token`, t)
      return {data: []}
    }
    id=t._id
  }
  return Promise.resolve({ model, fields, id, params })

}

setPreprocessGet(preProcessGet)

const canPatientStartCoaching = async (patientId, loggedUser) => {

  const [loadedUser] = await loadFromDb({
    model: 'user', 
    id: patientId, 
    fields: ['latest_coachings.creation_date', 'latest_coachings.appointments', 'latest_coachings.status','company.current_offer.coaching_credit', 'surveys', 'available_packs'], 
    user: loggedUser}
  )
  
  // Some companies require surveuy to start a coaching
  if (loadedUser.company.coaching_requires_survey && !lodash.isEmpty(loadedUser.surveys)) {
    throw new Error(`Le questionnaire doit être renseigné pour démarrer un coaching`)
  }

  // Available packs which contain a checkup
  const pack=loadedUser.available_packs.find(p => !!p.checkup)

  const latest_coaching = loadedUser.latest_coachings?.[0] || null
  if (!!latest_coaching) {
    if (![COACHING_STATUS_DROPPED, COACHING_STATUS_FINISHED, COACHING_STATUS_STOPPED].includes(latest_coaching.status)) {
      throw new Error(`Un coaching est déjà en cours ${latest_coaching}`)
    }
    if (moment().isSame(latest_coaching.creation_date, 'year')) {
      if (pack) {
        return pack
      }
      throw new Error(`Un coaching a déjà été démarré cette année`)
    }
  }
  if (!loadedUser.company?.current_offer?.coaching_credit) {
    if (pack) {
      return pack
    }
    throw new Error(`Le crédit de coaching est épuisé`)
  }
  const offer=loadedUser?.company?.current_offer
  if (!offer) {
    if (pack) {
      return pack
    }
    throw new Error(`Votre compagnie n'a aucune offre en cours`)
  }
  if (!offer.coaching_credit>0) {
    if (pack) {
      return pack
    }
    throw new Error(`Vous n'avez pas de crédit de coaching`)
  }

  return true
}


const preCreate = async ({ model, params, user }) => {
  if (model=='pack' && ![ROLE_ADMIN, ROLE_SUPER_ADMIN].includes(user.role)) { 
    throw new ForbiddenError(`Vous n'avez pas le droit de créer un pack`)
  }

  if (model=='ticket') {
    if (user?.role!=ROLE_EXTERNAL_DIET) {
      throw new Error(`Vous devez être diet pour créer un ticket`)
    }
    params.sender=user?.email
    const ticket=new Ticket(params)
    const errors=await ticket.validate()
    if (errors) {return errors}
    // Convert URL to Readable
    if (params.attachment) {
      const attStream=await axios.get(params.attachment, {responseType: "stream"})
        .then(res => res.data)
      params.attachment=attStream
    }
    return createTicket(params)
      .then(() => ({data: []}))
  }
  if (model=='ticketComment') {
    if (user?.role!=ROLE_EXTERNAL_DIET) {
      throw new Error(`VOus devez être diet pour commenter un ticket`)
    }
    params.jiraid=params.parent
    const comment=new TicketComment(params)
    const errors=await comment.validate()
    if (errors) {return errors}
    return createComment(params)
      .then(() => ({data: []}))
  }
  if (model=='logbookDay') {
    return logbooksConsistency(user._id, params.day)
      .then(() => ({data: {_id: moment(params.day).unix()}}))
  }
  if (model=='coaching') {
    const patient_id=user?.role==ROLE_CUSTOMER ? user._id : params.parent

    const pack=await canPatientStartCoaching(patient_id, user)
    // If a pack is used, already spent credit is 0
    if (pack) {
      params._company_cedits_spent=0
    }
    params.user=patient_id
    params.offer=(await User.findById(patient_id).populate({path: 'company', populate: 'current_offer'})).company.current_offer
    params.pack=lodash.isBoolean(pack) ? null : pack
  }
  if (['diploma', 'comment', 'measure', 'content', 'collectiveChallenge', 'individualChallenge', 'webinar', 'menu'].includes(model)) {
    params.user = params?.user || user
  }
  if (['message'].includes(model)) {
    params.sender = user
    return Conversation.getFromUsers(user, params.destinee)
      .then(c => ({model, params:{...params, conversation: c._id}}))
  }
  if (['content'].includes(model)) {
    params.creator = user
  }
  if (['team'].includes(model)) {
    return Team.findOne({ name: params.name?.trim(), collectiveChallenge: params.collectiveChallenge }).populate('collectiveChallenge')
      .then(team => {
        if (team) { throw new BadRequestError(`L'équipe ${params.name} existe déjà pour ce challenge`) }
        return CollectiveChallenge.findById(params.collectiveChallenge)
      })
      .then(challenge => {
        if (!challenge) { throw new BadRequestError(`Le challenge ${params.collectiveChallenge} n'existe pas`) }
        if (moment().isAfter(moment(challenge.start_date))) { throw new BadRequestError(`Le challenge a déjà démarré`) }
        return { model, params }
      })
  }
  if (model == 'quizzQuestion') {
    if (user.role == ROLE_EXTERNAL_DIET) {
      params.diet_private = user._id
    }
  }
  if (model=='nutritionAdvice') {
    if (!(user.role==ROLE_EXTERNAL_DIET)) {
      throw new Error(`Seule une diet peut créer un conseil nut`)
    }
  }
  // Handle both nutrition advice & appointment
  if (['nutritionAdvice', 'appointment'].includes(model)) {
    const loadedModel=await getModel(params.parent)

    const isAppointment = model == 'appointment'
    if (![ROLE_EXTERNAL_DIET, ROLE_CUSTOMER, ROLE_SUPPORT, ROLE_ADMIN, ROLE_SUPER_ADMIN].includes(user.role)) {
      throw new ForbiddenError(`Seuls les rôles patient, diet et support peuvent prendre un rendez-vous`)
    }
    let customer_id, diet
    if (user.role != ROLE_CUSTOMER) {
      if (!params.parent) { throw new BadRequestError(`Le patient doit être sélectionné`) }
      // Appointment created by operator directly with a 1st appointment
      if (loadedModel=='coaching') {
        const coaching=await Coaching.findById(params.parent).populate('diet')
        if (!coaching.diet) {
          if (!params['diet.email']) { throw new BadRequestError(`Le/la diet doit être sélectionné(e)`) }
          diet=(await User.findOne({role: ROLE_EXTERNAL_DIET, email: params['diet.email']}))?._id
          if (!diet) {
            throw new NotFoundError(`Diet ${diet.email} introuvable`)
          }
        }
        customer_id=coaching.user._id
        coaching.diet=diet
        await coaching.save()
      }
      else {
        customer_id = params.parent
        diet=user
      }
    }
    else { //CUSTOMER
      customer_id = user._id
    }
    const [usr]=await loadFromDb({
      model: 'user', id: customer_id,
      fields: [
        'email', 'latest_coachings.appointments', 'latest_coachings.reasons', 'latest_coachings.remaining_credits', 
        'latest_coachings.appointment_type', 
        'nutrition_advices', 
        'company.current_offer.nutrition_credit', 'spent_nutrition_credits',
        'company.reasons', 'phone', 'latest_coachings.diet',
        'latest_coachings.offer.nutrition_credit',
        'company.current_offer.nutrition_credit',
      ],
      user,
    })
    // Phone is required for appintment
    if (lodash.isEmpty(usr.phone)) {
      throw new BadRequestError(`Le numéro de téléphone est obligatoire pour prendre rendez-vous`)
    }
    // If company has coaching reasons, check if the user coaching intersects at least one
    const company_reasons=usr.company?.reasons
    if (company_reasons?.length > 0) {
      const user_reasons=usr.latest_coachings?.[0]?.reasons
      if (!setIntersects(user_reasons, company_reasons)) {
        throw new BadRequestError(`Vos motifs de consultation ne sont pas pris en charge par votre compagnie`)
      }
    }
    // Check remaining credits
    const latest_coaching = usr.latest_coachings[0]
    if (!latest_coaching && isAppointment) {
      throw new ForbiddenError(`Aucun coaching en cours`)
    }

    console.log('spent', usr.spent_nutrition_credits, 'credit', usr.comany?.current_offer?.nutrition_credit)
    const remaining_nut=usr.company?.current_offer?.nutrition_credit-usr.spent_nutrition_credits

    if ((isAppointment && latest_coaching.remaining_credits <= 0)
      || (!isAppointment && !(remaining_nut > 0))) {
      throw new ForbiddenError(`L'offre ne permet pas/plus de prendre un rendez-vous`)
    }
    // Check appointment to come
    const nextAppt=isAppointment && latest_coaching.appointments.find(a => moment(a.end_date).isAfter(moment()))
    if (nextAppt) {
      throw new ForbiddenError(`Un rendez-vous est déjà prévu le ${moment(nextAppt.start_date).format('L à LT')}`)
    }

    if (user.role==ROLE_CUSTOMER) {
      diet=latest_coaching.diet
    }
    
    if (isAppointment) {
      const start=moment(params.start_date)
      if (latest_coaching?.diet?.smartagenda_id) {
        const availabilities=await getAvailabilities({
          // FIX May lead to incorrect diet's appintment if taken by a diet other than te coaching's one
          // The selected diet should be the logged one (pb diet/operator)
          diet_id: latest_coaching?.diet?.smartagenda_id, 
          appointment_type: latest_coaching.appointment_type?.smartagenda_id,
          from: moment(start).add(-1, 'day').startOf('day'),
          to: moment(start).endOf('day'),
        })
        const exists=availabilities.some(a => Math.abs(start.diff(a.start_date, 'second'))<2)
        if (!exists) {
          throw new Error(`Ce créneau n'est plus disponible`)
        }
      }
      // Create progress quizz for appointment
      const progressUser = await createAppointmentProgress({coaching: latest_coaching._id})
      const res= { model, params: { progress: progressUser._id, user: customer_id, diet, coaching: latest_coaching._id, appointment_type: latest_coaching.appointment_type._id, ...params } }
      return res
    }
    else { // Nutrition advice
      return { model, params: { patient_email: usr.email, diet, ...params } }
    }
  }
  return Promise.resolve({ model, params })
}

setPreCreateData(preCreate)

const postPutData = async ({ model, params, id, value, data, user }) => {
  if (model == 'appointment' && params.logbooks) {
    return Appointment.findById(id)
      .then(appointment => logbooksConsistency(appointment.user._id))
      .then(() => params)
  }
  if (model == 'coaching' && params.quizz_templates) {
    const tpl_attribute = 'quizz_templates'
    const inst_attribute = 'quizz'
    return mongoose.models.coaching.findById(id).populate([
      { path: tpl_attribute, populate: 'questions' },
      { path: inst_attribute, populate: { path: 'quizz', populate: 'questions' } },
    ])
      .then(coaching => {
        const extraUserQuizz = coaching[inst_attribute].filter(uq => !coaching[tpl_attribute].some(q => idEqual(q._id, uq.quizz._id)))
        const missingUserQuizz = differenceSet(coaching[tpl_attribute], coaching[inst_attribute].map(uq => uq.quizz))
        const addQuizzs = Promise.all(missingUserQuizz.map(q => q.cloneAsUserQuizz(coaching)))
        return addQuizzs
          .then(quizzs => mongoose.models.coaching.findByIdAndUpdate(id, { $addToSet: { [inst_attribute]: quizzs } }))
          .then(() => mongoose.models.coaching.findByIdAndUpdate(id, { $pull: { [inst_attribute]: { $in: extraUserQuizz } } }))
          .then(() => Promise.all(extraUserQuizz.map(q => q.delete())))
          .then(() => mongoose.models.coaching.findById(id))
      })
  }
  // Validate appointment if this is a progress quizz answer
  if (model=='userQuizzQuestion') {
    const quizz=await UserQuizz.findOne({questions: id, type: QUIZZ_TYPE_PROGRESS})
    const appt=await Appointment.findOne({progress: quizz})
    if (appt) {
      appt.validated=true
      await appt.save().catch(console.error)
    }
  }
  if (model=='lead') {
    const call_status=params.call_status
    if (!!call_status) {
      const lead=await Lead.findById(id)
      const last_status=lead._call_status_history.pop()?.call_status
      if (last_status!=call_status) {
        await Lead.findByIdAndUpdate(
          id, 
          {$set: {call_date: moment()}},
          {$push: {_call_status_history: {date:moment(), call_status}}}
        )
      }
    }
  }
  return Promise.resolve(params)
}

setPostPutData(postPutData)

const USER_MODELS = ['user', 'loggedUser', 'patient', 'diet']
USER_MODELS.forEach(m => {
  declareVirtualField({ model: m, field: 'fullname', instance: 'String', requires: 'firstname,lastname', 
    dbFilter: value => ({$or:[{firstname: value}, {lastname: value}]}),
    dbSort: value => ({firstname: value, lastname: value}),
  })
  declareVirtualField({ model: m, field: 'password2', instance: 'String' })
  declareEnumField({ model: m, field: 'home_status', enumValues: HOME_STATUS })
  declareEnumField({ model: m, field: 'role', enumValues: ROLES })
  declareEnumField({ model: m, field: 'gender', enumValues: GENDER })
  declareEnumField({ model: m, field: 'activity', enumValues: ACTIVITY })
  
  declareVirtualField({
    model: m, field: 'contents', instance: 'Array',
    requires: 'dummy,objective_targets,health_targets,activity_target,specificity_targets,home_target',
    multiple: true,
    caster: {
      instance: 'ObjectID',
      options: { ref: 'content' }
    },
  })
  declareVirtualField({
    model: m, field: 'webinars', instance: 'Array',
    requires: 'company,company.webinars.key,skipped_events,passed_events', multiple: true,
    caster: {
      instance: 'ObjectID',
      options: { ref: 'webinar' }
    },
  })
  declareVirtualField({
    model: m, field: 'available_webinars', instance: 'Array',
    requires: 'webinars', multiple: true,
    caster: {
      instance: 'ObjectID',
      options: { ref: 'webinar' }
    },
  })
  declareVirtualField({
    model: m, field: 'past_webinars', instance: 'Array',
    requires: '_all_webinars', multiple: true,
    caster: {
      instance: 'ObjectID',
      options: { ref: 'webinar' }
    },
  })
  declareVirtualField({
    model: m, field: '_all_events', instance: 'Array',
    requires: 'dummy,_all_menus,_all_individual_challenges,collective_challenges,_all_webinars',
    multiple: true,
    caster: {
      instance: 'ObjectID',
      options: { ref: 'webinar' }
    },
  })
  declareVirtualField({
    model: m, field: '_all_webinars', instance: 'Array',
    requires: 'company.webinars', multiple: true,
    caster: {
      instance: 'ObjectID',
      options: { ref: 'webinar' }
    },
  })
  declareVirtualField({
    model: m, field: '_all_individual_challenges', instance: 'Array', multiple: true,
    caster: {
      instance: 'ObjectID',
      options: { ref: 'individualChallenge' }
    },
  })
  declareVirtualField({
    model: m, field: 'individual_challenges', instance: 'Array',
    requires: '_all_individual_challenges.key,skipped_events,passed_events,routine_events,registered_events.type,_all_individual_challenges.type,failed_events,current_individual_challenge',
    multiple: true,
    caster: {
      instance: 'ObjectID',
      options: { ref: 'individualChallenge' }
    },
  })
  declareVirtualField({
    model: m, field: 'passed_individual_challenges', instance: 'Array',
    // TODO WTF available_menus is required to get passed_individual_challenges !!!
    requires: '_all_individual_challenges,passed_events,registered_events,available_menus', multiple: true,
    caster: {
      instance: 'ObjectID',
      options: { ref: 'individualChallenge' }
    },
  })
  declareVirtualField({
    model: m, field: '_all_menus', instance: 'menu',
    requires: 'dummy',
    multiple: true,
    caster: {
      instance: 'ObjectID',
      options: { ref: 'menu' }
    },
  })
  declareVirtualField({
    model: m, field: 'available_menus', instance: 'Array',
    requires: 'dummy',
    multiple: true,
    caster: {
      instance: 'ObjectID',
      options: { ref: 'menu' }
    },
  })
  declareVirtualField({
    model: m, field: 'past_menus', instance: 'Array',
    requires: 'dummy',
    multiple: true,
    caster: {
      instance: 'ObjectID',
      options: { ref: 'menu' }
    },
  })
  declareVirtualField({
    model: m, field: 'future_menus', instance: 'Array',
    requires: 'dummy',
    multiple: true,
    caster: {
      instance: 'ObjectID',
      options: { ref: 'menu' }
    },
  })
  declareVirtualField({
    model: m, field: 'collective_challenges', instance: 'Array', multiple: true,
    requires: 'company,company.collective_challenges',
    caster: {
      instance: 'ObjectID',
      options: { ref: 'collectiveChallenge' }
    },
  })
  declareVirtualField({
    model: m, field: 'available_groups', instance: 'Array',
    requires: 'targets,company.groups,company.groups.targets,registered_groups,company.groups.key', multiple: true,
    caster: {
      instance: 'ObjectID',
      options: { ref: 'group' }
    },
  })
  declareVirtualField({
    model: m, field: 'registered_groups', instance: 'Array', multiple: true,
    caster: {
      instance: 'ObjectID',
      options: { ref: 'group' }
    },
  })
  declareVirtualField({
    model: m, field: 'measures', instance: 'Array',
    multiple: true,
    caster: {
      instance: 'ObjectID',
      options: { ref: 'measure' }
    },
  })
  declareVirtualField({
    model: m, field: 'last_measures', instance: 'Array',
    requires: 'measures', multiple: true,
    caster: {
      instance: 'ObjectID',
      options: { ref: 'measure' }
    },
  })
  declareVirtualField({
    model: m, field: 'pinned_contents', instance: 'Array',
    multiple: true,
    caster: {
      instance: 'ObjectID',
      options: { ref: 'content' }
    },
  })
  declareVirtualField({
    model: m, field: 'pinned_recipes', instance: 'Array',
    multiple: true,
    caster: {
      instance: 'ObjectID',
      options: { ref: 'recipe' }
    },
  })
declareVirtualField({
    model: m, field: 'targets', instance: 'Array',
    requires: 'objective_targets,health_targets,activity_target,specificity_targets,home_target',
    multiple: true,
    caster: {
      instance: 'ObjectID',
      options: { ref: 'target' }
    },
  })
  declareVirtualField({
    model: m, field: 'current_individual_challenge', instance: 'individualChallenge',
    requires: 'registered_events,failed_events,passed_events,passed_events,routine_events',
    multiple: false,
    caster: {
      instance: 'ObjectID',
      options: { ref: 'individualChallenge' }
    },
  })
  declareVirtualField({
    model: m, field: 'offer', instance: 'offer',
    requires: 'company.offers',
    multiple: false,
    caster: {
      instance: 'ObjectID',
      options: { ref: 'offer' }
    },
  })
  declareVirtualField({
    model: m, field: 'surveys', instance: 'Array',
    multiple: true,
    caster: {
      instance: 'ObjectID',
      options: { ref: 'userSurvey' }
    },
  })
  declareVirtualField({
    model: m, field: 'diploma', instance: 'Array',
    multiple: true,
    caster: {
      instance: 'ObjectID',
      options: { ref: 'diploma' }
    },
  })
  declareEnumField({ model: m, field: 'registration_status', enumValues: DIET_REGISTRATION_STATUS })
  declareVirtualField({
    model: m, field: 'diet_comments', instance: 'Array',
    multiple: true,
    caster: {
      instance: 'ObjectID',
      options: { ref: 'dietComment' }
    },
  })
  declareVirtualField({
    model: m, field: 'diet_average_note', instance: 'Number',
    requires: 'diet_comments._defined_notes'
  })
  declareVirtualField({
    model: m, field: 'profile_progress', instance: 'Number',
    requires: 'diploma,adeli,siret,signed_charter'
  })
  declareVirtualField({
    model: m, field: 'diet_objectives', instance: 'Array',
    multiple: true,
    caster: {
      instance: 'ObjectID',
      options: { ref: 'quizzQuestion' }
    },
  })
  declareVirtualField({
    model: m, field: 'coachings', instance: 'Array',
    multiple: true,
    caster: {
      instance: 'ObjectID',
      options: { ref: 'coaching' }
    },
  })
  declareVirtualField({model: m, field: 'coachings_count', instance: 'Number'})
  declareVirtualField({
    model: m, field: 'latest_coachings', instance: 'Array', multiple: true,
    caster: {
      instance: 'ObjectID',
      options: { ref: 'coaching' }
    },
  })
  declareVirtualField({
    model: m, field: 'diet_questions', instance: 'Array',
    multiple: true,
    caster: {
      instance: 'ObjectID',
      options: { ref: 'quizzQuestion' }
    },
  })
  declareVirtualField({
    model: m, field: 'diet_coachings', instance: 'Array',
    multiple: true,
    caster: {
      instance: 'ObjectID',
      options: { ref: 'coaching' }
    },
  })
  declareVirtualField({
    model: m, field: 'diet_appointments', instance: 'Array',
    multiple: true,
    caster: {
      instance: 'ObjectID',
      options: { ref: 'appointment' }
    },
  })
  declareComputedField({model: 'user', field: 'diet_appointments_count', getterFn: async (userId, params, data) => Appointment.count({diet: userId})})
  declareVirtualField({
    model: m, field: 'diet_current_future_appointments', instance: 'Array',
    multiple: true,
    caster: {
      instance: 'ObjectID',
      options: { ref: 'appointment' }
    },
  })
  declareEnumField({ model: m, field: 'registration_warning', enumValues: REGISTRATION_WARNING })
  declareEnumField({ model: m, field: 'activities', enumValues: DIET_ACTIVITIES })
  declareVirtualField({
    model: m, field: 'availability_ranges', instance: 'Array',
    multiple: true,
    caster: {
      instance: 'ObjectID',
      options: { ref: 'range' }
    },
  })
  declareVirtualField({ model: m, field: 'imc', instance: 'Number', requires: 'measures,height' })
  declareVirtualField({ model: m, field: 'days_inactivity', instance: 'Number', requires: 'last_activity' })
  declareVirtualField({
    model: m, field: 'keys', instance: 'Array',
    requires: 'dummy',
    multiple: true,
    caster: {
      instance: 'ObjectID',
      options: { ref: 'key' }
    },
  })
  declareVirtualField({
    model: m, field: 'all_logbooks', instance: 'Array', multiple: true,
    caster: {
      instance: 'ObjectID',
      options: { ref: 'coachingLogbook' }
    },
  })
  declareVirtualField({
    model: m, field: 'logbooks', instance: 'Array', multiple: true,
    requires: 'all_logbooks.logbook.questions.multiple_answers,all_logbooks.logbook.questions.answer_status',
    caster: {
      instance: 'ObjectID',
      options: { ref: 'logbookDay' }
    },
  }),
  declareVirtualField({
    model: m, field: 'nutrition_advices', instance: 'Array', multiple: true,
    requires: 'email,role',
    caster: {
      instance: 'ObjectID',
      options: { ref: 'nutritionAdvice' }
    },
  }),
  declareVirtualField({ model: m, field: 'spent_nutrition_credits', instance: 'Number', requires: 'email'})
  declareVirtualField({
    model: m, field: 'remaining_nutrition_credits', instance: 'Number',
    requires: 'company.current_offer.nutrition_credit,spent_nutrition_credits,role'
  })
  declareVirtualField({
    model: m, field: 'can_buy_pack', instance: 'Boolean',
    requires: 'latest_coachings.in_progress,available_packs,company.current_offer.coaching_credit',
  })
  declareVirtualField({
    model: m, field: 'purchases', instance: 'Array', multiple: true,
    caster: {
      instance: 'ObjectID',
      options: { ref: 'purchase'}
    },
  })
  declareVirtualField({
    model: m, field: 'available_packs', instance: 'Array', multiple: true,
    requires: 'purchases.pack,coachings.pack',
    caster: {
      instance: 'ObjectID',
      options: { ref: 'pack'}
    },
  })
  declareVirtualField({ model: m, field: 'search_text', instance: 'String', requires: USER_SEARCH_TEXT_FIELDS,
    dbFilter: createSearchFilter({attributes: USER_SEARCH_TEXT_FIELDS}),
  })

})
// End user/loggedUser

declareEnumField({ model: 'company', field: 'activity', enumValues: COMPANY_ACTIVITY })
declareVirtualField({
  model: 'company', field: 'administrators', instance: 'Array', multiple: true,
  caster: {
    instance: 'ObjectID',
    options: { ref: 'user' }
  },
})
declareVirtualField({
  model: 'company', field: 'webinars', instance: 'Array', multiple: true,
  caster: {
    instance: 'ObjectID',
    options: { ref: 'webinar' }
  },
})
declareVirtualField({
  model: 'company', field: 'groups', instance: 'Array', multiple: true,
  caster: {
    instance: 'ObjectID',
    options: { ref: 'group' }
  },
})
declareVirtualField({ model: 'company', field: 'likes_count', instance: 'Number' })
declareVirtualField({ model: 'company', field: 'comments_count', instance: 'Number' })
declareVirtualField({ model: 'company', field: 'shares_count', instance: 'Number' })
declareVirtualField({ model: 'company', field: 'groups_count', instance: 'Number', requires: 'groups' })
declareVirtualField({
  model: 'company', field: 'children', instance: 'Array', multiple: true,
  caster: {
    instance: 'ObjectID',
    options: { ref: 'company' }
  },
})
declareVirtualField({model: 'company', field: 'contents', instance: 'Array', multiple: true,
  caster: {
    instance: 'ObjectID',
    options: { ref: 'content' }
  },
})
declareVirtualField({
  model: 'company', field: 'collective_challenges', instance: 'Array', multiple: true,
  caster: {
    instance: 'ObjectID',
    options: { ref: 'collectiveChallenge' }
  },
})
declareVirtualField({
  model: 'company', field: 'offers', instance: 'Array', multiple: true,
  caster: {
    instance: 'ObjectID',
    options: { ref: 'offer' }
  },
})
declareVirtualField({
  model: 'company', field: 'users', instance: 'Array', multiple: true,
  caster: {
    instance: 'ObjectID',
    options: { ref: 'user' }
  },
})
declareComputedField({model: 'company', field: 'leads', requires: 'code', getterFn: getCompanyLeads})
declareVirtualField({model: 'company', field: 'current_offer', instance: 'offer'})


declareEnumField({ model: 'content', field: 'type', enumValues: CONTENTS_TYPE })
declareVirtualField({ model: 'content', field: 'likes_count', instance: 'Number', requires: 'likes' })
declareVirtualField({ model: 'content', field: 'shares_count', instance: 'Number', requires: 'shares' })
declareVirtualField({
  model: 'content', field: 'comments', instance: 'Array', multiple: true,
  caster: {
    instance: 'ObjectID',
    options: { ref: 'comment' }
  },
})
declareVirtualField({ model: 'content', field: 'comments_count', instance: 'Number', requires: 'comments' })
declareVirtualField({ model: 'content', field: 'search_text', instance: 'String', requires: 'name,contents' })
declareEnumField({ model: 'content', field: 'visibility', enumValues: CONTENT_VISIBILITY })
declareEnumField({ model: 'content', field: 'article_star', enumValues: CONTENT_ARTICLE })

declareVirtualField({ model: 'dietComment', field: '_defined_notes', instance: 'Number', multiple: 'true' })

const getEventStatus = (userId, params, data) => {
  return Promise.all([
    User.findById(userId, { registered_events: 1, passed_events: 1, failed_events: 1, skipped_events: 1, routine_events: 1 }),
    getModel(data._id, ['event', 'menu', 'webinar', 'individualChallenge', 'collectiveChallenge'])
  ])
    .then(([user, modelName]) => {
      if (modelName == 'individualChallenge') {
        // Past if failed or passed or skipped or routine
        if (['passed_events', 'failed_events', 'skipped_events', 'routine_events'].some(att => {
          return user[att].some(e => idEqual(e._d, data._id))
        })) {
          return APPOINTMENT_PAST
        }
        if (user.registered_events.some(e => idEqual(e.event._id, data._id))) {
          return APPOINTMENT_CURRENT
        }
        return APPOINTMENT_TO_COME
      }
      const now = moment()
      return now.isAfter(data.end_date) ? APPOINTMENT_PAST :
        now.isBefore(data.start_date) ? APPOINTMENT_TO_COME :
          APPOINTMENT_CURRENT
    })
    .catch(console.error)
}

const EVENT_MODELS = ['event', 'collectiveChallenge', 'individualChallenge', 'menu', 'webinar']
EVENT_MODELS.forEach(m => {
  declareVirtualField({ model: m, field: 'type', instance: 'String', enumValues: EVENT_TYPE })
  declareVirtualField({ model: m, field: 'duration', instance: 'Number', requires: 'start_date,end_date' })
  // declareVirtualField({ model: m, field: 'status', instance: 'String', requires: 'start_date,end_date', enumValues: APPOINTMENT_STATUS })
  declareEnumField({ model: m, field: 'status', enumValues: APPOINTMENT_STATUS })
  declareComputedField({model: m, field: 'status', getterFn: getEventStatus})
  declareVirtualField({ model: m, field: 'registered_count', instance: 'Number'})
})

declareEnumField({ model: 'individualChallenge', field: 'hardness', enumValues: HARDNESS })

declareEnumField({ model: 'category', field: 'type', enumValues: TARGET_TYPE })
declareVirtualField({
  model: 'category', field: 'targets', instance: 'Array', multiple: true,
  caster: {
    instance: 'ObjectID',
    options: { ref: 'target' }
  },
})

declareEnumField({ model: 'spoonGain', field: 'source', enumValues: SPOON_SOURCE })

declareVirtualField({
  model: 'offer', field: 'company', instance: 'offer', multiple: false,
  caster: {
    instance: 'ObjectID',
    options: { ref: 'company' }
  },
})

declareVirtualField({
  model: 'target', field: 'contents', instance: 'Array',
  multiple: true,
  caster: {
    instance: 'ObjectID',
    options: { ref: 'content' }
  },
})
declareVirtualField({
  model: 'target', field: 'groups', instance: 'Array', multiple: true,
  caster: {
    instance: 'ObjectID',
    options: { ref: 'group' }
  },
})
declareVirtualField({
  model: 'target', field: 'users', instance: 'Array', multiple: true,
  caster: {
    instance: 'ObjectID',
    options: { ref: 'user' }
  },
})

declareEnumField({ model: 'recipe', field: 'nutriscore', enumValues: NUTRISCORE })
declareEnumField({ model: 'recipe', field: 'ecoscore', enumValues: ECOSCORE })
declareVirtualField({
  model: 'recipe', field: 'ingredients', instance: 'Array',
  multiple: true,
  caster: {
    instance: 'ObjectID',
    options: { ref: 'recipeIngredient' }
  },
})
declareEnumField({ model: 'recipe', field: 'season', enumValues: SEASON })
declareVirtualField({ model: 'recipe', field: 'type', instance: 'String', requires: 'duration', enumValues: RECIPE_TYPE })
declareVirtualField({
  model: 'recipe',
  field: 'comments',
  instance: 'Array',
  multiple: true,
  caster: {
    instance: 'ObjectID',
    options: { ref: 'comment' }
  },
})
declareVirtualField({ model: 'recipe', field: 'comments_count', instance: 'Number', requires: 'comments' })
declareVirtualField({ model: 'recipe', field: 'likes_count', instance: 'Number', requires: 'likes' })

declareVirtualField({
  model: 'menu', field: 'recipes', instance: 'Array',
  multiple: true,
  caster: {
    instance: 'ObjectID',
    options: { ref: 'menuRecipe' }
  },
})
declareVirtualField({ model: 'menu', field: 'people_count', instance: 'Number' })

declareEnumField({ model: 'ingredient', field: 'unit', enumValues: UNIT })
declareVirtualField({ model: 'ingredient', field: 'label', instance: 'String', requires: 'name,unit' })

declareVirtualField({
  model: 'group', field: 'messages', instance: 'Array',
  multiple: true,
  caster: {
    instance: 'ObjectID',
    options: { ref: 'message' }
  },
})
declareVirtualField({ model: 'group', field: 'users_count', instance: 'Number' })
declareVirtualField({ model: 'group', field: 'messages_count', instance: 'Number', requires: 'messages' })

declareVirtualField({ model: 'message', field: 'likes_count', instance: 'Number', requires: 'likes' })

declareVirtualField({
  model: 'comment', field: 'children', instance: 'Array',
  multiple: true,
  caster: {
    instance: 'ObjectID',
    options: { ref: 'comment' }
  },
})

declareVirtualField({ model: 'key', field: 'dummy', instance: 'Number'})


declareVirtualField({
  model: 'userSurvey', field: 'questions', instance: 'Array',
  multiple: true,
  caster: {
    instance: 'ObjectID',
    options: { ref: 'userQuestion' }
  },
})

declareEnumField({ model: 'userQuestion', field: 'answer', enumValues: SURVEY_ANSWER })

declareEnumField({ model: 'menuRecipe', field: 'day', enumValues: DAYS })
declareEnumField({ model: 'menuRecipe', field: 'period', enumValues: PERIOD })
declareEnumField({ model: 'menuRecipe', field: 'position', enumValues: MEAL_POSITION })

declareVirtualField({ model: 'userQuestion', field: 'index', instance: 'Number', requires: 'survey.questions' })
declareVirtualField({ model: 'userQuestion', field: 'total', instance: 'Number', requires: 'survey.questions' })

declareVirtualField({
  model: 'pip', field: 'comments', instance: 'Array', multiple: true,
  caster: {
    instance: 'ObjectID',
    options: { ref: 'comment' }
  },
})
declareVirtualField({ model: 'pip', field: 'comments_count', instance: 'Number'})

declareVirtualField({
  model: 'team', field: 'members', instance: 'Array', multiple: true,
  caster: {
    instance: 'ObjectID',
    options: { ref: 'teamMember' }
  },
})
declareVirtualField({ model: 'team', field: 'spoons_count', instance: 'Number', requires: 'members.pips.valid' })

declareVirtualField({ model: 'teamMember', field: 'spoons', instance: 'Number' })
declareVirtualField({
  model: 'teamMember', field: 'pips', instance: 'Array', multiple: true,
  caster: {
    instance: 'ObjectID',
    options: { ref: 'challengeUserPip' }
  },
})

declareVirtualField({
  model: 'collectiveChallenge', field: 'teams', instance: 'Array', multiple: true,
  caster: {
    instance: 'ObjectID',
    options: { ref: 'team' }
  },
})

declareVirtualField({
  model: 'collectiveChallenge', field: 'pips', instance: 'Array', multiple: true,
  caster: {
    instance: 'ObjectID',
    options: { ref: 'challengePip' }
  },
})

declareVirtualField({
  model: 'challengePip', field: 'userPips', instance: 'Array', multiple: true,
  requires: 'userPips.valid,pip.spoons',
  caster: {
    instance: 'ObjectID',
    options: { ref: 'challengeUserPip' }
  },
})
declareVirtualField({ model: 'challengePip', field: 'spoons', instance: 'Number' })
declareVirtualField({
  model: 'challengePip', field: 'pendingUserPips', instance: 'Array', multiple: true,
  requires: 'userPips.proof,userPips.valid',
  caster: {
    instance: 'ObjectID',
    options: { ref: 'challengeUserPip' }
  },
})

declareVirtualField({
  model: 'coaching', field: 'appointments', instance: 'Array', multiple: true,
  caster: {
    instance: 'ObjectID',
    options: { ref: 'appointment' }
  },
})
declareVirtualField({
  model: 'coaching', field: 'latest_appointments', instance: 'Array', multiple: true,
  caster: {
    instance: 'ObjectID',
    options: { ref: 'appointment' }
  },
})
declareVirtualField({
  model: 'coaching', field: 'appointments_future', instance: 'Array', multiple: true,
  caster: {
    instance: 'ObjectID',
    options: { ref: 'appointment' }
  },
})
declareVirtualField({
  model: 'coaching', field: 'remaining_credits', instance: 'Number',
  requires: 'offer.coaching_credit,spent_credits,user.role,pack.follow_count'
}
)
declareVirtualField({ model: 'coaching', field: 'spent_credits', instance: 'Number'})
declareEnumField({ model: 'coaching', field: 'status', enumValues: COACHING_STATUS})

declareVirtualField({
  model: 'coaching', field: 'questions', instance: 'Array', multiple: true,
  caster: {
    instance: 'ObjectID',
    options: { ref: 'userCoachingQuestion' }
  },
})
declareEnumField({ model: 'coaching', field: 'mode', instance: 'String', enumValues: COACHING_MODE })
declareVirtualField({
  model: 'coaching', field: '_all_diets', instance: 'Array', multiple: true,
  requires: 'dummy',
  caster: {
    instance: 'ObjectID',
    options: { ref: 'user' }
  },
})
declareComputedField({model: 'coaching', field: 'available_diets', 
  requires: `_all_diets.smartagenda_id,_all_diets.reasons,_all_diets.customer_companies,_all_diets.availability_ranges,user.company,appointment_type,_all_diets.diet_coaching_enabled`,
  getterFn: getAvailableDiets
})
declareVirtualField({
  model: 'coaching', field: 'current_objectives', instance: 'Array', multiple: true,
  requires: 'appointments.objectives',
  caster: {
    instance: 'ObjectID',
    options: { ref: 'quizzQuestion' }
  },
})
declareVirtualField({
  model: 'coaching', field: 'quizz', instance: 'Array', multiple: true,
  caster: {
    instance: 'ObjectID',
    options: { ref: 'userQuizz' }
  },
})
declareVirtualField({
  model: 'coaching', field: 'progress', instance: 'Array', multiple: true,
  caster: {
    instance: 'ObjectID',
    options: { ref: 'userQuizz' }
  },
})
declareComputedField({model: 'coaching', field: 'diet_availabilities', requires:'user.company,diet,appointment_type', getterFn: getDietAvailabilities})

declareVirtualField({
  model: 'coaching', field: 'appointment_type', instance: 'appointmentType',
  requires: 'appointments,user.company.assessment_appointment_type,user.company.followup_appointment_type',
  multiple: false,
  caster: {
    instance: 'ObjectID',
    options: { ref: 'appointmentType' }
  },
})
declareVirtualField({
  model: 'coaching', field: 'nutrition_advices', instance: 'Array',
  multiple: true,
  caster: {
    instance: 'ObjectID',
    options: { ref: 'nutritionAdvice' }
  },
})
declareVirtualField({model: 'coaching', field: '_last_appointment', instance: 'appointment'})
declareVirtualField({model: 'coaching', field: 'in_progress', instance: 'Boolean', requires: 'status'})
declareComputedField({model: 'coaching', field: 'assessment_certificate', type: 'String', 
  requires: 'user.firstname,user.lastname,user.company.name,_assessment_certificate',
  getterFn: getAssessmentCertificate,
})
declareComputedField({model: 'coaching', field: 'final_certificate', type: 'String', 
  requires: 'user.firstname,user.lastname,user.company.name,_final_certificate',
  getterFn: getFinalCertificate,
})


declareEnumField({ model: 'userCoachingQuestion', field: 'status', enumValues: COACHING_QUESTION_STATUS })

//start adminDashboard
declareVirtualField({
  model: 'adminDashboard', field: 'company', instance: 'company', multiple: false,
  caster: {
    instance: 'ObjectID',
    options: { ref: 'company' }
  },
})
declareVirtualField({ model: 'adminDashboard', field: 'diet', instance: 'ObjectId' })
declareVirtualField({ model: 'adminDashboard', field: 'start_date', instance: 'Date' })
declareVirtualField({ model: 'adminDashboard', field: 'end_date', instance: 'Date' })
declareVirtualField({ model: 'adminDashboard', field: 'webinars_count', instance: 'Number' })
declareVirtualField({ model: 'adminDashboard', field: 'average_webinar_registar', instance: 'Number' })
declareVirtualField({ model: 'adminDashboard', field: 'webinars_replayed_count', instance: 'Number' })
declareVirtualField({ model: 'adminDashboard', field: 'groups_count', instance: 'Number' })
declareVirtualField({ model: 'adminDashboard', field: 'group_active_members_count', instance: 'Number' })
declareVirtualField({ model: 'adminDashboard', field: 'average_group_answers', instance: 'Number' })
declareVirtualField({ model: 'adminDashboard', field: 'messages_count', instance: 'Number' })
declareVirtualField({ model: 'adminDashboard', field: 'users_count', instance: 'Number' })
declareVirtualField({ model: 'adminDashboard', field: 'active_users_count', instance: 'Number' })
declareVirtualField({ model: 'adminDashboard', field: 'leads_count', instance: 'Number' })
declareVirtualField({ model: 'adminDashboard', field: 'users_men_count', instance: 'Number' })
declareVirtualField({ model: 'adminDashboard', field: 'user_women_count', instance: 'Number' })
declareVirtualField({ model: 'adminDashboard', field: 'users_no_gender_count', instance: 'Number' })
declareVirtualField({ model: 'adminDashboard', field: 'started_coachings', instance: 'Number' })
declareVirtualField({
  model: 'adminDashboard', field: `specificities_users`, instance: 'Array', multiple: true,
  caster: {
    instance: 'ObjectID',
    options: { ref: 'graphData' }
  },
})
declareVirtualField({
  model: 'adminDashboard', field: `reasons_users`, instance: 'Array', multiple: true,
  caster: {
    instance: 'ObjectID',
    options: { ref: 'graphData' }
  },
})
declareVirtualField({ model: 'adminDashboard', field: 'coachings_started', instance: 'Number' })
declareVirtualField({ model: 'adminDashboard', field: 'coachings_finished', instance: 'Number' })
declareVirtualField({ model: 'adminDashboard', field: 'coachings_stopped', instance: 'Number' })
declareVirtualField({ model: 'adminDashboard', field: 'coachings_dropped', instance: 'Number' })
declareVirtualField({ model: 'adminDashboard', field: 'coachings_ongoing', instance: 'Number' })
declareVirtualField({ model: 'adminDashboard', field: 'ratio_stopped_started', instance: 'Number' })
declareVirtualField({ model: 'adminDashboard', field: 'ratio_dropped_started', instance: 'Number' })
declareVirtualField({ model: 'adminDashboard', field: 'nut_advices', instance: 'Number' })
declareVirtualField({ model: 'adminDashboard', field: 'coachings_gender_unknown', instance: 'Number' })
declareVirtualField({ model: 'adminDashboard', field: 'coachings_gender_male', instance: 'Number' })
declareVirtualField({ model: 'adminDashboard', field: 'coachings_gender_female', instance: 'Number' })
declareVirtualField({ model: 'adminDashboard', field: 'coachings_gender_non_binary', instance: 'Number' })
declareVirtualField({ model: 'adminDashboard', field: 'coachings_renewed', instance: 'Number' })
declareVirtualField({
  model: 'adminDashboard', field: 'jobs_details', instance: 'Array', multiple: true,
  caster: {
    instance: 'ObjectID',
    options: { ref: 'pair' }
  },
})
declareVirtualField({ model: 'adminDashboard', field: 'jobs_total', instance: 'Number' })
declareVirtualField({
  model: 'adminDashboard', field: 'join_reasons_details', instance: 'Array', multiple: true,
  caster: {
    instance: 'ObjectID',
    options: { ref: 'pair' }
  },
})
declareVirtualField({
  model: 'adminDashboard', field: 'jobs_details', instance: 'Array', multiple: true,
  caster: {
    instance: 'ObjectID',
    options: { ref: 'pair' }
  },
})
declareVirtualField({ model: 'adminDashboard', field: 'join_reasons_total', instance: 'Number' })
declareVirtualField({
  model: 'adminDashboard', field: 'decline_reasons_details', instance: 'Array', multiple: true,
  caster: {
    instance: 'ObjectID',
    options: { ref: 'pair' }
  },
})
declareVirtualField({ model: 'adminDashboard', field: 'decline_reasons_total', instance: 'Number' })

declareVirtualField({
  model: 'adminDashboard', field: 'leads_by_campain', instance: 'Array', multiple: true,
  caster: {
    instance: 'ObjectID',
    options: { ref: 'pair' }
  },
})
declareVirtualField({ model: 'adminDashboard', field: 'webinars_by_company_total', instance: 'Number' })
declareVirtualField({
  model: 'adminDashboard', field: 'webinars_by_company_details', instance: 'Array', multiple: true,
  caster: {
    instance: 'ObjectID',
    options: { ref: 'pair' }
  },
})
declareVirtualField({
  model: 'adminDashboard', field: 'coachings_stats', instance: 'Array', multiple: true,
  caster: {
    instance: 'ObjectID',
    options: { ref: 'coachingStat' }
  },
})
declareVirtualField({
  model: 'adminDashboard', field: 'calls_stats', instance: 'Array', multiple: true,
  caster: {
    instance: 'ObjectID',
    options: { ref: 'pair' }
  },
})
declareEnumField({ model: 'coaching', field: 'source', enumValues: SOURCE })
declareEnumField({ model: 'nutritionAdvice', field: 'source', enumValues: SOURCE })
declareComputedField({ 
  model: 'nutritionAdvice', field: 'certificate', type: 'String', 
  requires: 'start_date,_user.firstname,_user.lastname,_certificate,_user.company.nutadvice_certificate_template,_user.company.name',
  getterFn: getNutAdviceCertificate,
})
declareVirtualField({
  model: 'nutritionAdvice', field: '_lead', instance: 'lead', multiple: false,
  caster: {
    instance: 'ObjectID',
    options: { ref: 'lead' }
  },
})
declareVirtualField({
  model: 'nutritionAdvice', field: '_user', instance: 'user', multiple: false,
  caster: {
    instance: 'ObjectID',
    options: { ref: 'user' }
  },
})
declareVirtualField({ model: 'adminDashboard', field: 'ratio_appointments_coaching', instance: 'Number' })
declareVirtualField({ model: 'adminDashboard', field: 'diet_coaching_enabled', instance: 'Number' })
declareVirtualField({ model: 'adminDashboard', field: 'diet_site_enabled', instance: 'Number' })
declareVirtualField({ model: 'adminDashboard', field: 'diet_visio_enabled', instance: 'Number' })
declareVirtualField({ model: 'adminDashboard', field: 'diet_recruiting', instance: 'Number' })
declareVirtualField({ model: 'adminDashboard', field: 'diet_refused', instance: 'Number' })
declareVirtualField({ model: 'adminDashboard', field: 'diet_activated', instance: 'Number' })
//end adminDashboard

declareEnumField({ model: 'foodDocument', field: 'type', enumValues: FOOD_DOCUMENT_TYPE })
declareVirtualField({ model: 'foodDocument', field: 'url', type: 'String', requires: 'manual_url,document' })

declareVirtualField({
  model: 'quizz', field: 'questions', instance: 'company', multiple: false,
  caster: {
    instance: 'ObjectID',
    options: { ref: 'quizzQuestion' }
  },
})
declareEnumField({ model: 'quizz', field: 'type', enumValues: QUIZZ_TYPE })

declareEnumField({ model: 'quizzQuestion', field: 'type', enumValues: QUIZZ_QUESTION_TYPE })
declareVirtualField({
  model: 'quizzQuestion', field: 'available_answers', instance: 'Array', multiple: true,
  caster: {
    instance: 'ObjectID',
    options: { ref: 'item' }
  },
})

const APP_MODELS=['appointment','currentFutureAppointment','pastAppointment']
APP_MODELS.forEach(model => {
  declareVirtualField({
    model: model, field: 'status', instance: 'String',
    requires: 'start_date,end_date,validated', enumValues: APPOINTMENT_STATUS,
  })
})

declareVirtualField({
  model: 'userQuizzQuestion', field: 'order', instance: 'Number',
  requires: 'userQuizz.questions',
})
declareVirtualField({
  model: 'userQuizzQuestion', field: 'multiple_answers',
  instance: 'Array', multiple: true,
  caster: {
    instance: 'ObjectID',
    options: { ref: 'item' }
  },
})
declareVirtualField({
  model: 'userQuizzQuestion', field: 'answer_status', instance: 'String',
  requires: 'single_enum_answer,quizz_question.correct_answer', enumValues: ANSWER_STATUS,
})
declareVirtualField({
  model: 'userQuizzQuestion', field: 'answer_message', instance: 'String',
  requires: 'answer_status,quizz_question.success_message,quizz_question.error_message'
})


declareEnumField({ model: 'userQuizz', field: 'type', enumValues: QUIZZ_TYPE })

declareVirtualField({ model: 'range', field: 'day', instance: 'Date', requires: 'start_date' })
declareVirtualField({
  model: 'range', field: 'range_str', instance: 'String',
  requires: 'start_date,end_date',
})
declareVirtualField({
  model: 'range', field: 'duration', instance: 'String',
  requires: 'appointment_type',
})
declareVirtualField({
  model: 'range', field: 'end_date', instance: 'String',
  requires: 'start_date,duration',
})

declareVirtualField({
  model: 'lead', field: 'fullname', instance: 'String',
  requires: 'firstname,lastname',
})
declareVirtualField({
  model: 'lead', field: 'company',
  instance: 'Company', multiple: false, requires: 'company_code',
  caster: {
    instance: 'ObjectID',
    options: { ref: 'company' }
  },
})
declareEnumField({ model: 'lead', field: 'call_status', enumValues: CALL_STATUS })
declareVirtualField({
  model: 'lead', field: 'job',
  instance: 'job', multiple: false,
  caster: {
    instance: 'ObjectID',
    options: { ref: 'job' }
  },
})
declareVirtualField({
  model: 'lead', field: 'declineReason',
  instance: 'declineReason', multiple: false,
  caster: {
    instance: 'ObjectID',
    options: { ref: 'declineReason' }
  },
})
declareVirtualField({
  model: 'lead', field: 'joinReason',
  instance: 'joinReason', multiple: false,
  caster: {
    instance: 'ObjectID',
    options: { ref: 'joinReason' }
  },
})
declareEnumField({ model: 'lead', field: 'call_direction', enumValues: CALL_DIRECTION })
declareVirtualField({
  model: 'lead', field: 'registered_user',
  instance: 'Array', multiple: true,
  caster: {
    instance: 'ObjectID',
    options: { ref: 'user' }
  },
})
declareVirtualField({
  model: 'lead', field: 'registered', instance: 'Boolean',
  requires: 'registered_user',
})
declareEnumField({ model: 'lead', field: 'coaching_converted', enumValues: COACHING_CONVERSION_STATUS })
declareVirtualField({
  model: 'lead', field: 'nutrition_advices',
  instance: 'Array', multiple: true,
  caster: {
    instance: 'ObjectID',
    options: { ref: 'nutritionAdvice' }
  },
})
declareVirtualField({ model: 'lead', field: 'search_text', instance: 'String', requires: LEAD_SEARCH_TEXT_FIELDS,
  dbFilter: createSearchFilter({attributes: LEAD_SEARCH_TEXT_FIELDS}),
})

declareVirtualField({
  model: 'nutritionAdvice', field: 'end_date', instance: 'Date',
  requires: 'start_date,duration',
})

declareVirtualField({model: 'conversation', field: 'messages',instance: 'Array', multiple: true,
  caster: {
    instance: 'ObjectID',
    options: { ref: 'message' }
  },
})
declareVirtualField({model: 'conversation', field: 'latest_messages',instance: 'Array', multiple: true,
  caster: {
    instance: 'ObjectID',
    options: { ref: 'message' }
  },
})
declareVirtualField({model: 'conversation', field: 'messages_count',instance: 'Number'})

declareEnumField({model: 'nutritionAdvice', field: 'gender', enumValues: GENDER})

/** Ticketing START */
declareVirtualField({model: 'ticket', field: 'comments',instance: 'Array', multiple: true,
  caster: {
    instance: 'ObjectID',
    options: { ref: 'ticketComment' }
  },
})
declareEnumField({model: 'ticket', field: 'priority', enumValues: TICKET_PRIORITY})

/** Ticketing END */

/** Purchase START */
declareEnumField({model: 'purchase', field: 'status', enumValues: PURCHASE_STATUS})
/** Purchase END  */

/** History START */
// declareEnumField({model: 'history', field: 'docModel', enumValues: {lead: 'Lead'}})
/** History END  */

const getConversationPartner = (userId, params, data) => {
  return Conversation.findById(data._id, {users:1})
    .then(conv => {
      return conv.getPartner(userId) 
    })
    .then(partner => {
      return User.findById(partner._id).populate('company')
    })
}

declareComputedField({model: 'conversation', field: 'partner', getterFn: getConversationPartner})


const getDataLiked = (userId, params, data) => {
  const liked = data?.likes?.some(l => idEqual(l._id, userId))
  return Promise.resolve(liked)
}

const setDataLiked = ({ id, attribute, value, user }) => {
  return getModel(id, ['comment', 'message', 'content', 'recipe'])
    .then(model => {
      if (value) {
        // Set liked
        return mongoose.models[model].findByIdAndUpdate(id, { $addToSet: { likes: user._id } })
      }

      // Remove liked
      return mongoose.models[model].findByIdAndUpdate(id, { $pullAll: { likes: [user._id] } })

    })
}

const getDataPinned = (userId, params, data) => {
  const pinned = data?.pins?.some(l => idEqual(l._id, userId))
  return Promise.resolve(pinned)
}

const setDataPinned = ({ id, attribute, value, user }) => {
  return getModel(id, ['message', 'content', 'recipe'])
    .then(model => {
      if (value) {
        // Set liked
        return mongoose.models[model].findByIdAndUpdate(id, { $addToSet: { pins: user._id } })
      }

      // Remove liked
      return mongoose.models[model].findByIdAndUpdate(id, { $pullAll: { pins: [user._id] } })

    })
}

const getPinnedMessages = (userId, params, data) => {
  return Promise.resolve(data.messages?.filter(m => m.pins?.some(p => idEqual(p._id, userId))))
}

const getMenuShoppingList = (userId, params, data) => {
  return mongoose.models.menu.findById(data._id).populate({path: 'recipes', populate: {path: 'recipe', populate: {path: 'ingredients', populate: {path: 'ingredient'}}}}).lean()
    .then(data => {
      const people_count = parseInt(params.people_count) || MENU_PEOPLE_COUNT
      const ratio = people_count / MENU_PEOPLE_COUNT
      const ingredients = lodash.flatten(data?.recipes.map(r => r.recipe?.ingredients).filter(v => !!v))
      const ingredientsGroup = lodash.groupBy(ingredients, i => i.ingredient._id)
      const result = lodash(ingredientsGroup)
        .mapValues(ingrs => ({ ingredient: ingrs[0].ingredient, quantity: lodash.sumBy(ingrs, 'quantity') * ratio }))
        .values()
        .map(({ ingredient, quantity }) => {
          const [newQuantity, newUunit] = convertQuantity(quantity, ingredient.unit)
          return ({
            ingredient: { ...ingredient, unit: newUunit },
            quantity: parseInt(newQuantity * 100) / 100,
          })
        })
        .value()
      return Promise.resolve(result)
    })
}

const getUserKeySpoonsStr = (userId, params, data) => {
  return getUserKeySpoons(userId, params, data)
    .then(count => {
      return `${count} cuillère${count > 1 ? 's' : ''}`
    })
}

const getUserSurveysProgress = (userId, params, data) => {
  // Get max possible answer
  const maxAnswer = lodash.maxBy(Object.keys(SURVEY_ANSWER), v => parseInt(v))
  return UserSurvey.find({ user: userId })
    .sort({ [CREATED_AT_ATTRIBUTE]: -1 })
    .populate({ path: 'questions', populate: { path: 'question' } })
    .lean({ virtuals: true })
    // Keep surveys questions depending on current ky (==data)
    // TODO: try to filter in populate section above
    .then(surveys => surveys.map(s => ({ ...s, questions: s.questions.filter(q => !!q.answer && idEqual(q.question.key, data._id)) })))
    // Keep surveys having still questions
    .then(surveys => surveys.filter(s => !lodash.isEmpty(s.questions)))
    // Keep questions progress
    .then(surveys => surveys.map(s => ({
      date: s[CREATED_AT_ATTRIBUTE],
      value_1: (lodash.sumBy(s.questions, q => parseInt(q.answer) || 0) * 100.0 / (s.questions.length * maxAnswer)),
    })))
}

const getUserContents = async (userId, params, data) => {
  const user=await User.findById(data._id)
  const user_targets = lodash([user.objective_targets, user.health_targets,
    user.activity_target, user.specificity_targets, user.home_target])
    .flatten()
    .filter(v => !!v)
    .map(t => t._id)
    .value()
  return Content.find({targets: {$in: user_targets}})
}

const getUserPassedChallenges = (userId, params, data) => {
  return User.findById(userId, 'passed_events')
    .populate({ path: 'passed_events', match: { "__t": "individualChallenge", key: data._id } })
    .then(res => {
      return res.passed_events?.length || 0
    })
}

const getUserPassedWebinars = (userId, params, data) => {
  return User.findById(userId, 'passed_events')
    .populate({ path: 'passed_events', match: { "__t": "webinar", key: data._id } })
    .then(res => {
      return res.passed_events?.length || 0
    })
}

const getDietPatients = (userId, params, data) => {
  const limit=parseInt(params['limit.diet_patients']) || Number.MAX_SAFE_INTEGER-1
  const page=parseInt(params['page.diet_patients']) || 0
  return Coaching.distinct('user', {diet: userId})
    .then(users => User.find({_id: users}).skip(page*limit).limit(limit+1).populate('company'))
}

const getDietPatientsCount = (userId, params, data) => {
  return Coaching.distinct('user', {diet: userId})
    .then(users => users.length)
}

// declareComputedField({model: 'user', field: 'contents', getterFn: getUserContents})
// declareComputedField({model: 'loggedUser', field: 'contents', getterFn: getUserContents})
declareComputedField({model: 'user', field: 'diet_patients_count', getterFn: getDietPatientsCount})
declareComputedField({model: 'user', field: 'spoons_count', getterFn: getUserSpoons})
declareComputedField({model: 'loggedUser', field: 'diet_patients_count', getterFn: getDietPatientsCount})
declareComputedField({model: 'loggedUser', field: 'spoons_count', getterFn: getUserSpoons})
declareComputedField({model: 'comment', field: 'liked', getterFn: getDataLiked, setterFn: setDataLiked})
declareComputedField({model: 'message', field: 'liked', getterFn: getDataLiked, setterFn: setDataLiked})
declareComputedField({model: 'content', field: 'liked', getterFn: getDataLiked, setterFn: setDataLiked})
declareComputedField({model: 'recipe', field: 'liked', getterFn: getDataLiked, setterFn: setDataLiked})
declareComputedField({model: 'message', field: 'pinned', getterFn: getDataPinned, setterFn: setDataPinned})
declareComputedField({model: 'content', field: 'pinned', getterFn: getDataPinned, setterFn: setDataPinned})
declareComputedField({model: 'group', field: 'pinned_messages', getterFn: getPinnedMessages})
declareComputedField({model: 'individualChallenge', field: 'trophy_picture', getterFn: getUserIndChallengeTrophy})
declareComputedField({model: 'individualChallenge', field: 'obtained', getterFn: getObtainedTrophy})
declareComputedField({model: 'key', field: 'trophy_picture', getterFn: getUserKeyTrophy})
declareComputedField({model: 'key', field: 'user_spoons', getterFn: getUserKeySpoons})
declareComputedField({model: 'key', field: 'user_spoons_str', getterFn: getUserKeySpoonsStr})
declareComputedField({model: 'key', field: 'user_progress', getterFn: getUserKeyProgress})
declareComputedField({model: 'key', field: 'user_read_contents', getterFn: getUserKeyReadContents})
declareComputedField({model: 'key', field: 'user_passed_challenges', getterFn: getUserPassedChallenges})
declareComputedField({model: 'key', field: 'user_passed_webinars', getterFn: getUserPassedWebinars})
declareComputedField({model: 'menu', field: 'shopping_list', getterFn: getMenuShoppingList})
declareComputedField({model: 'key', field: 'user_surveys_progress', getterFn: getUserSurveysProgress})

/** Pack start */
declareComputedField({model: 'pack', field: 'discount_price', requires: 'price', getterFn: 
  async (userId, params, data) => {
    const discount=(await User.findById(userId).populate('company')).company?.pack_discount || 0
    let res=data.price*(1.0-discount)
    res=parseInt(res*100)/100
    return res
  }
})

declareComputedField({model: 'pack', field: 'has_discount', getterFn: 
  async (userId, params, data) => {
    const discount=(await User.findById(userId).populate('company')).company?.pack_discount || 0
    return discount>0
  }
})

declareVirtualField({model: 'pack', field: 'description', type: 'String', requires: 'payment_count'})

/** Pack end */

/** AppointmentType START */
declareVirtualField({model: 'appointmentType', field: 'is_nutrition', type: 'Boolean', instance: 'Boolean', requires: 'title'})
/** AppointmentType END  */

const postCreate = async ({ model, params, data, user }) => {
  // Create company => duplicate offer
  if (model == 'company') {
    const validity_start=moment()
    const validity_end=moment().add(1, 'year')
    const assessment_quizz=await Quizz.findOne({type: QUIZZ_TYPE_ASSESSMENT})
    const offer=await Offer.findById(params.current_offer)
    const name=`Offre ${offer.name} pour ${data.name}`
    console.log(`Offer name is`, name)
    await Offer.create({...simpleCloneModel(offer), company: data._id, name,assessment_quizz, validity_start, validity_end})
    return data
  }
  if (model == 'collectiveChallenge') {
    return Pip.find()
      .then(pips => Promise.all(pips.map(p => ChallengePip.create({ pip: p, collectiveChallenge: data }))))
      .then(() => {
        ensureChallengePipsConsistency()
        return data
      })
  }
  if (model == 'pip') {
    ensureChallengePipsConsistency()
  }
  if (model == 'teamMember') {
    ensureChallengePipsConsistency()
  }
  if (model == 'coaching') {
    return CoachingQuestion.find()
      .then(questions => Promise.all(questions.map(question => userCoachingQuestion.create({ coaching: data, question }))))
  }

  if (['user'].includes(model) && data.role == ROLE_EXTERNAL_DIET) {
    return Promise.allSettled([
      sendDietPreRegister2Diet({ user: data }),
      User.find({ role: { $in: [ROLE_ADMIN, ROLE_SUPER_ADMIN] } })
        .then(admins => Promise.allSettled(admins.map(admin => sendDietPreRegister2Admin({ user: data, admin }))))
    ])
      .then(() => data)
  }
  // Create coaching.progress if not present
  // Create assessment quizz if this is the first appointment
  if (model == 'appointment') {
    const setProgressQuizz = Coaching.findById(data.coaching._id).populate('user')
      .then(coaching => {
        /** If lead exists: 
         * - if user is an operator, set coaching conversion status to TO_COME
         * - if any user and lead is coaching cancelled, set status to TO_COME
        */
        Lead.findOneAndUpdate(
          { email: coaching.user.email},
          { coaching_converted: COACHING_CONVERSION_TO_COME },
          { new: true, runValidators: true }
        )
          .then(console.log)
          .catch(console.error)
        return updateCoachingStatus(coaching._id)
      })

    const createSmartagendaAppointment = Appointment.findById(data._id)
      .populate({ path: 'coaching', populate: ['user', 'diet'] })
      .populate('appointment_type')
      .then(appt => {
        return createAppointment(appt.coaching.diet.smartagenda_id, appt.coaching.user.smartagenda_id,
          appt.appointment_type.smartagenda_id, appt.start_date, appt.end_date)
          .then(smart_appt => {
            appt.smartagenda_id = smart_appt.id;
            return getAppointmentVisioLink(smart_appt.id)
          })
          .then(url => {
            appt.visio_url = url
            return appt.save()
          })
      })

    await updateCoachingStatus(data.coaching._id)
    return Promise.allSettled([setProgressQuizz, createSmartagendaAppointment])
      .then(console.log)
      .catch(console.error)
      .finally(() => data)
  }

  // If operator created nutrition advice, set lead nutrition converted
  if (model == 'nutritionAdvice') {
      await Lead.findOneAndUpdate({ email: data.patient_email }, { nutrition_converted: true })
        .then(res => `Nutrition conversion:${res}`)
        .catch(err => `Nutrition conversion:${err}`)
      const nutAdvice=await NutritionAdvice.findById(data._id)
        .populate({path: '_user', populate: {path: 'company', populate: 'nutrition_advice_appointment_type'}}) 
        .populate('diet')
      if (!nutAdvice._user) {
        return console.log(`Nutrition advice for a lead => can not create in agenda`)
      }
      const smartAppt=await createAppointment(nutAdvice.diet.smartagenda_id, nutAdvice._user.smartagenda_id, 
        nutAdvice._user.company.nutrition_advice_appointment_type.smartagenda_id, moment(nutAdvice.start_date), 
        moment(nutAdvice.start_date).add(nutAdvice.duration, 'minutes')
      )
      nutAdvice.smartagenda_id=smartAppt.id
      return nutAdvice.save()
  }


  if (model=='pack') {
    const stripe_id=await upsertProduct({name: data.title, description: data.description})
    await Pack.findByIdAndUpdate(data._id, {stripe_id: stripe_id})
  }
  return data
}

setPostCreateData(postCreate)

const postDelete = ({ model, data }) => {
  if (['appointment', 'nutritionAdvice'].includes(model)) {
    deleteAppointment(data.smartagenda_id)
  }
}

setPostDeleteData(postDelete)

const prePut = async data => {
  const {model, params}=data
  if (model=='user' && !!params.password) {
    await validatePassword(params)
  }
  if (model === 'company') {
    if (params.registration_integrity === null) {
      params.registration_integrity = false;
    }
  }
  return data
}

setPrePutData(prePut)

const ensureChallengePipsConsistency = () => {
  // Does every challenge have all pips ?
  return Promise.all([Pip.find({}, "_id"), CollectiveChallenge.find({}, "_id"),
  TeamMember.find().populate('team'), ChallengeUserPip.find()])
    .then(([pips, challenges, teamMembers, challengeUserPips]) => {
      // Ensure all challenge pips exist
      const updateChallengePips = lodash.product(pips, challenges)
        .map(([pip, challenge]) => ChallengePip.updateMany(
          { pip: pip, collectiveChallenge: challenge },
          { pip: pip, collectiveChallenge: challenge },
          { upsert: true }
        ))
      Promise.all(updateChallengePips)
        .then(res => {
          console.log(`Upsert challenge pips ok:${JSON.stringify(res)}`)
          // Ensure all team mebers pips exist
          const updateMembersPips = ChallengePip.find()
            .then(challengePips => {
              return teamMembers.map(member => {
                const pips = challengePips.filter(p => idEqual(p.collectiveChallenge, member.team.collectiveChallenge))
                return Promise.all(pips.map(p => {
                  return ChallengeUserPip.update(
                    { pip: p, user: member },
                    { pip: p, user: member },
                    { upsert: true }
                  )
                }))
              })
            })

          Promise.all(updateMembersPips)
            .then(res => console.log(`Upsert member pips ok:${JSON.stringify(res)}`))
            .catch(err => console.error(`Upsert member pips error:${err}`))
        })
        .catch(err => console.error(`Upsert challenge pips error:${err}`))

    })
}


const computeStatistics = async ({ fields, company, start_date, end_date, diet }) => {
  const comp=await Company.findById(company).populate('children')
  const companyFilter = comp ? {$in: [comp._id, ...comp.children.map(c => c._id)]} : { $ne: null };
  const result = {};
  result.company = company?.toString();
  const cache = {};

  const fetchAndCache = async (field, func, params) => {
    if (cache[field]) return;
    cache[field] = true;
    try {
      if (typeof func !== 'function') {
        console.error(`Error: ${func} is not a function`);
        result[field] = undefined;
        return;
      }
      const functionResult = await func(params);
      result[field] = functionResult;
    } catch (error) {
      console.error(`Error while executing ${func}:`, error);
      result[field] = undefined;
    }
  };

  const handleRatios = async (field) => {
    if (!cache['coachings_started']) {
      await fetchAndCache('coachings_started', kpi['coachings_started'], { companyFilter, start_date, end_date, diet });
    }
    if (field === 'ratio_stopped_started') {
      if (!cache['coachings_stopped']) {
        await fetchAndCache('coachings_stopped', kpi['coachings_stopped'], { companyFilter, start_date, end_date, diet });
      }
      result['ratio_stopped_started'] = result['coachings_started'] !== 0 
        ? Number((result['coachings_stopped'] / result['coachings_started'] * 100).toFixed(2)) 
        : 0;
    } else if (field === 'ratio_dropped_started') {
      if (!cache['coachings_dropped']) {
        await fetchAndCache('coachings_dropped', kpi['coachings_dropped'], { companyFilter, start_date, end_date, diet });
      }
      result['ratio_dropped_started'] = result['coachings_started'] !== 0 
        ? Number((result['coachings_dropped'] / result['coachings_started'] * 100).toFixed(2)) 
        : 0;
    } else if (field === 'ratio_appointments_coaching') {
      if (!cache['coachings_ongoing']) {
        await fetchAndCache('coachings_ongoing', kpi['coachings_ongoing'], { companyFilter, start_date, end_date, diet });
      }
      try {
        const appts = await kpi.validated_appts({company, start_date, end_date, diet});
        result['ratio_appointments_coaching'] = result['coachings_started'] !== 0 
          ? Number((appts / (result['coachings_started'] - result['coachings_ongoing'])).toFixed(2)) 
          : 0;
      } catch (error) {
        console.error('Error calculating ratio_appointments_coaching:', error);
        result['ratio_appointments_coaching'] = undefined;
      }
    }
  };

  for (const field of fields) {
    if (['company', 'diet', 'start_date', 'end_date'].includes(field)) continue;
    if (!field.includes('gender') && !field.includes('coachings_stats') && !field.endsWith('_details') && !field.endsWith('_total') && !field.includes('ratio_')) {
      await fetchAndCache(field, kpi[field], {company, companyFilter, start_date, end_date, diet });
    } else {
      if (field.includes('coachings_stats')) {
        await fetchAndCache('coachings_stats', kpi['coachings_stats'], { company, start_date, end_date, diet });
      } else if (field.includes('coachings_gender')) {
        if (!cache['coachings_by_gender_']) {
          await fetchAndCache('coachings_by_gender_', kpi['coachings_by_gender_'], { companyFilter, start_date, end_date, diet });
          const genderResult = result['coachings_by_gender_'];
          for (const [gender, count] of Object.entries(genderResult)) {
            result[`coachings_gender_${gender}`] = count;
          }
        }
      } else if (field.endsWith('_details') || field.endsWith('_total')) {
        const baseField = field.replace('_details', '').replace('_total', '');
        await fetchAndCache(baseField, kpi[`${baseField}_`], { companyFilter, start_date, end_date, diet });
        const baseResult = result[baseField];
        result[`${baseField}_total`] = baseResult[`${baseField}_total`];
        result[`${baseField}_details`] = baseResult[`${baseField}_details`];
      } else if (field.includes('ratio_')) {
        await handleRatios(field);
      }
    }
  }
  return result;
};

exports.computeStatistics = computeStatistics;



/** Upsert PARTICULARS company */
Company.findOneAndUpdate(
  { name: PARTICULAR_COMPANY_NAME },
  { name: PARTICULAR_COMPANY_NAME, activity: COMPANY_ACTIVITY_SERVICES_AUX_ENTREPRISES },
  { upsert: true },
)
  .then(() => console.log(`Particular company upserted`))
  .catch(err => console.error(`Particular company upsert error:${err}`))

// Ensure user logbooks consistency
const logbooksConsistency = async (user_id, day) => {
  const idFilter = user_id ? { _id: user_id } : {}
  const startDay = day ? moment(day) : moment().add(-1, 'day')
  const endDay = day ? moment(day).add(1, 'day') : moment().add(1, 'days')
  const logBooksFilter = { $and: [{ day: { $gte: startDay.startOf('day') } }, { day: { $lte: endDay.endOf('day') } }] }
  return User.find(idFilter).populate(
    { path: 'all_logbooks', match: logBooksFilter, populate: { path: 'logbook', populate: 'quizz' } },
  )
    .then(users => {
      return runPromisesWithDelay(users.map((user, idx) => async () => {
        const appointments=await Appointment.find({user})
          .populate({ path: 'logbooks', populate: { path: 'questions'}})

        const getLogbooksForDay = date => {
          // Get the appointment juste before the date
          const previous_appt = lodash(appointments)
            .filter(a => a.end_date < date.endOf('day'))
            .maxBy(a => a.start_date)
          const appt_logbooks = previous_appt ? [...previous_appt.logbooks] : []
          return Quizz.find({ type: QUIZZ_TYPE_LOGBOOK, default: true }).populate('questions')
            .then(defaultQuizzs => {
              appt_logbooks.push(...defaultQuizzs)
              return lodash.uniqBy(appt_logbooks, q => q._id.toString())
            })
        }
        const diff = endDay.diff(startDay, 'days')
        return Promise.all(lodash.range(diff).map(day_idx => {
          const day = moment(startDay).add(day_idx, 'day')
          // expected quizz templates
          return getLogbooksForDay(day)
            .then(expectedQuizz => {
              const userLogBooks = user.all_logbooks.filter(l => moment(l.day).isSame(day, 'day'))
              // Logbooks missing in patient's coaching
              const missingQuizz = expectedQuizz.filter(q => !userLogBooks.some(cl => idEqual(cl.logbook.quizz._id, q._id)))
              console.log('missing quizzs', missingQuizz.length)
              // Logbooks to remove from patient's coaching
              const extraQuizz = userLogBooks.filter(l => !expectedQuizz.some(q => idEqual(q._id, l.logbook.quizz._id)))
              // Add missing quizz
              return Promise.all(missingQuizz.map(q => q.cloneAsUserQuizz()))
                .then(quizzs => Promise.all(quizzs.map(q => CoachingLogbook.create({ day, logbook: q, user }))))
                // remove extra quizz
                .then(quizzs => Promise.all(extraQuizz.map(q => {
                  // Remove user quizz
                  q.logbook.delete()
                  // Remove coaching logbook
                  return q.delete()
                })))
            })
        }))
      }))
      .then(console.log)

    })
}

const getRegisterCompany = props => {
  // No email : FUCK YOU
  if (!props.email) { return Promise.resolve({}) }
  const NO_COMPANY_NAME = 'NEVER'.repeat(10000)
  const code_re = props.company_code?.trim() || NO_COMPANY_NAME
  const mail_re = props.email
  const result = {}
  return Promise.all([Lead.findOne({ email: mail_re }), Company.findOne({ code: code_re })])
    .then(([lead, company]) => {
      console.log('mail', mail_re, 'lead', lead, 'company', company)
      // If company not found, get form lead company code if any
      if (!company && lead?.company_code) {
        return Promise.all([lead, Company.findOne({ code: lead.company_code })])
      }
      return [lead, company]
    })
    .then(([lead, company]) => {
      // Bad company code
      if (props.company_code && !company) {
        throw new NotFoundError(`Code entreprise ${props.company_code} inconnu`)
      }
      // lead code differs from company code
      if (lead?.company_code && company?.code && (lead.company_code != company.code)) {
        throw new BadRequestError(`Code entreprise incorrect, contactez un administrateur`)
      }
      // lead code differs from entered code
      if (lead?.company_code && props.company_code && (lead.company_code != props.company_code)) {
        throw new BadRequestError(`Code entreprise incorrect, contactez un administrateur`)
      }
      if (company?.code && lead?.company_code && (company.code == lead.company_code)) {
        // Code & lead match
        return ({ ...result, company: company._id })
      }
      // Code & lead match
      if (!company && !lead) {
        return ({ ...result })
      }

      if (company?.registration_integrity) {
        if (lead && !props.company_code) {
          return ({ ...result, registration_warning: REGISTRATION_WARNING_CODE_MISSING })
        }
        if (!lead) {
          return ({ ...result, registration_warning: REGISTRATION_WARNING_LEAD_MISSING })
        }
      }
      else {
        return ({ ...result, company: company._id })
      }
      return result
    })
}

setImportDataFunction({ model: 'lead', fn: importLeads })

// Ensure all spoon gains are defined
const ensureSpoonGains = () => {
  return Object.keys(SPOON_SOURCE).map(source => {
    return SpoonGain.exists({ source })
      .then(exists => {
        if (!exists) {
          return SpoonGain.create({ source, gain: 0 })
        }
      })
  })
}

ensureSpoonGains()

// Ensure logbooks consistency each morning
//cron.schedule('0 */15 * * * *', async() => {
false && cron.schedule('0 0 * * * *', async () => {
  logbooksConsistency()
    .then(() => console.log(`Logbooks consistency OK `))
    .catch(err => console.error(`Logbooks consistency error:${err}`))
})

// Synchronize diets & customer smartagenda accounts
!isDevelopment() && cron.schedule('0 * * * * *', () => {
  console.log(`Smartagenda accounts sync`)
  // Scan accounts with no smùartagenda_id, latest first
  return User.find(
    { 
      role: {$in: [ROLE_CUSTOMER, ROLE_EXTERNAL_DIET] }, 
      $or: [
        { smartagenda_id: { $exists: false } }, // Field does not exist
        { smartagenda_id: null },               // Field is explicitly null
        { smartagenda_id: '' }                  // Field is an empty string
      ]
    }).sort({update_date:1}).limit(50)
    .then(users => {
      console.log(`Sync ${users.length} users % smartagenda`)
      return runPromisesWithDelay(users.map(user => () => {
        const getFn = user.role == ROLE_EXTERNAL_DIET ? getAgenda : getAccount
        return getFn({ email: user.email })
          .then(id => {
            if (id) {
              console.log(`User ${user.email}/${user.role} found in smartagenda with id ${id}`)
              user.smartagenda_id = id
              return user.save()
            }
            // Create only customers, not allowed to create diets through API
            else if (user.role == ROLE_CUSTOMER) {
              const attrs = lodash.pick(user, ['email', 'firstname', 'lastname'])
              return upsertAccount(attrs)
                .then(id => {
                  console.log(`User ${user.email}/${user.role} created in smartagenda under id ${id}`)
                  user.smartagenda_id = id
                  return user.save()
                })
            }
          })
      }))
      .then(res => {
        const results=lodash.groupBy(res, 'status')
        if (!lodash.isEmpty(results.fulfilled)) {
          console.log('Smartagenda sync result OK for', results.fulfilled.length, 'accounts')
        }
        if (!lodash.isEmpty(results.rejected)) {
          console.error('Smartagenda sync errors', results.rejected.map(u => {
            return u.reason.response?.statusText || u.reason
          }))  
        }
      })
    })
})

const agendaHookFn = async received => {
  // Check validity
  console.log(`Received hook ${JSON.stringify(received)}`)
  const { senderSite, action, objId, objClass, data: { obj: { presta_id, equipe_id, client_id, start_date_gmt, end_date_gmt, internet, text } } } = received
  const AGENDA_NAME = getSmartAgendaConfig().SMARTAGENDA_URL_PART
  if ([HOOK_DELETE, HOOK_INSERT].includes(action) && AGENDA_NAME == senderSite && internet == "O") {
    return console.log(`Event coming for ourself: skipping`)
  }
  if (objClass != 'pdo_events') {
    throw new BadRequestError(`Received hook for model ${objClass} but only pdo_events is handled`)
  }
  if (action == HOOK_DELETE) {
    console.log(`Deleting appointment/CN smartagenda_id ${objId}`)
    return Promise.all([Appointment.remove({ smartagenda_id: objId }), NutritionAdvice.remove({ smartagenda_id: objId })])
      .then(console.log)
      .catch(console.error)
  }
  if (action == HOOK_INSERT) {
    console.log(`Inserting appointment/CN smartagenda_id ${objId}`)
    return Promise.all([
      User.findOne({ smartagenda_id: equipe_id, role: ROLE_EXTERNAL_DIET }),
      User.findOne({ smartagenda_id: client_id, role: ROLE_CUSTOMER }),
      AppointmentType.findOne({ smartagenda_id: presta_id }),
    ])
      .then(async ([diet, user, appointment_type]) => {
        if (!(diet && user && appointment_type)) {
          throw new BadRequestError(`Insert appointment missing info:diet ${equipe_id}=>${!!diet}, user ${client_id}=>${!!user} app type ${presta_id}=>${!!appointment_type}`)
        }
        if (appointment_type.is_nutrition) {
          return NutritionAdvice.create({
            start_date: start_date_gmt,
            comment: text || `Imported from appt ${appt._id} #${appt.order} in coaching ${appt.coaching._id}`,
            source: SOURCE_SMARTAGENDA,
            diet,
            patient_email: user.email,
          })
        }
        return Coaching.findOne({ user }).sort({ [CREATED_AT_ATTRIBUTE]: -1 }).limit(1)
          .then(async coaching => {
            if (!coaching) {
              throw new Error(`No coaching defined`)
            }
            const visio_url=await getAppointmentVisioLink(objId).catch(err => console.log('Can not get visio link for appointment', objId))
            const progressQuizz = await createAppointmentProgress({coaching: coaching._id})
            const appt=(await Appointment.findOne({ smartagenda_id: objId })) || new Appointment({})
            Object.assign(appt, {
              coaching: coaching, appointment_type, smartagenda_id: objId,
              start_date: start_date_gmt, end_date: end_date_gmt, visio_url,
              user, diet, progress: progressQuizz,progres: progressQuizz,
            })
            return appt.save()
          })
      })
      .then(console.log)
      .catch(console.error)
  }
  if (action == HOOK_UPDATE) {
    console.log(`Updating appointment/CN smartagenda_id ${objId}`)
    return Promise.all([
      Appointment.findOne({ smartagenda_id: objId }),
      NutritionAdvice.findOne({ smartagenda_id: objId }),
      AppointmentType.findOne({ smartagenda_id: presta_id }),
    ])
      .then(async ([appointment, nutAdvice, appointment_type]) => {
        if (!((appointment || nutAdvice) && appointment_type)) {
          throw new Error(`Update appointment missing info:${!!appointment} ${!!nutAdvice} ${!!appointment_type}`)
        }
        const visio_url=await getAppointmentVisioLink(objId).catch(err => console.log('Can not get visio link for appointment', objId))
        return Promise.all([
          Appointment.updateOne({ smartagenda_id: objId },{ appointment_type, start_date: start_date_gmt, end_date: end_date_gmt, visio_url, }),
          NutritionAdvice.updateOne({ smartagenda_id: objId },{ start_date: start_date_gmt}),
        ])
      })
      .then(console.log)
      .catch(console.error)
  }
}

/**
 *   {
    "event": "open",
    "time": 1708609191,
    "MessageID": 104145742346117660,
    "Message_GUID": "4f7f7a42-e645-443f-ad96-3b7a34bb599f",
    "email": "sebastien.auvray@wappizy.com",
    "mj_campaign_id": 7657476082,
    "mj_contact_id": 5754145803,
    "customcampaign": "mj.nl=10755340",
    "ip": "66.249.93.231",
    "geo": "EU",
    "agent": "Mozilla/5.0 (Windows NT 5.1; rv:11.0) Gecko Firefox/11.0 (via ggpht.com GoogleImageProxy)",
    "CustomID": "",
    "Payload": ""
  }
*/
// On "open" event received, tag the lead as mailOpened
const mailjetHookFn = received => {
  events=received.filter(e => e.event=='open')
  console.log('Mailjet received', events.length, ' "open" events')
  const emails=events.map(e => e.email)
  return Lead.updateMany({email: {$in: emails}}, {mail_opened: true})
    .then(res => console.log(`Updated ${emails.length} leads open mail`))
}

const preSave = async (model, id, values, isNew) => {
  if (model=='user') {
    // Create only customers in CRM
    const role=(await User.findById(id, {role:1}))?.role
    if (role==ROLE_CUSTOMER) {
      return crmUpsertAccount(id, values)
    }
  }
  if (model=='coaching') {
    const coaching=await Coaching.findById(id)
    if (coaching.user) {
      return crmUpsertAccount(coaching.user, values)    
    }
  }
  if (model=='appointment') {
    const appt=await Appointment.findById(id)
    if (appt.user) {
      return crmUpsertAccount(appt.user, values)    
    }
  }
}

registerPreSave(preSave)

// Update workflows
cron.schedule('0 0 8 * * *', async () => {
  updateWorkflows()
    .then(console.log)
    .catch(console.error)
})

// Update coaching status
false && cron.schedule('0 0 * * * *', async () => {
  console.log('Updating coaching status')
  return Coaching.find({}, {_id:1})
    .then(coachings => coachings.map(c => updateCoachingStatus(c._id)))
    .catch(console.error)
})

// Inactivity notifications
cron.schedule('0 0 8 * * *', async () => {
  const users = await User.find({ role: ROLE_CUSTOMER }, { email: 1, days_inactivity: 1, last_activity: 1 })
  // Inactivity notifications
  const DURATIONS = [[15, sendInactivity15], [30, sendInactivity30], [45, sendInactivity45]]
  DURATIONS.forEach(([duration, fn]) => {
    const selected = users.filter(u => u.days_inactivity == duration)
    selected.forEach(u => fn({ user: u }).catch(console.error))
  })
})

// Individual challenges notifications
cron.schedule('0 0 8 * * *', async () => {
  const users = await User.find({ role: ROLE_CUSTOMER }, { email: 1, registered_events: 1 })
    .populate({ path: 'registered_events', populate: { path: 'event', match: { __t: 'individualChallenge' } } })

  const hasChallengeStartedSince = (user, days) => {
    return user.registered_events.some(re => moment().diff(re.date, 'days') == days)
  }
  // Individual challenges
  const DURATIONS = [[1, sendIndChallenge1], [2, sendIndChallenge2], [3, sendIndChallenge3],
  [5, sendIndChallenge5], [6, sendIndChallenge6]]
  DURATIONS.forEach(([duration, fn]) => {
    const selected = users.filter(u => hasChallengeStartedSince(u, duration))
    selected.forEach(u => fn({ user: u }).catch(console.error))
  })
})

// New webinar for company
cron.schedule('0 0 8 * * *', async () => {
  const filter = { [CREATED_AT_ATTRIBUTE]: { $gte: moment().add(-1, 'day') } }
  const webinars = await Webinar.find(filter)
    .populate({ path: 'companies', populate: { path: 'users', match: { role: ROLE_CUSTOMER } } })
  webinars.forEach(webinar => {
    const users = lodash.flattenDeep(webinar.companies?.map(c => c.users))
    users.forEach(u => sendNewWebinar({ user: u, title: webinar.name, datetime: formatDateTime(webinar.start_date) }).catch(console.error))
  })
})

// Webinar in 3 days
cron.schedule('0 0 8 * * *', async () => {
  const filter = { start_date: { $gte: moment().add(3, 'day'), $lte: moment().add(4, 'day') } }
  const webinars = await Webinar.find(filter)
    .populate({ path: 'companies', populate: { path: 'users', match: { role: ROLE_CUSTOMER } } }).catch(console.error)
  webinars.forEach(webinar => {
    const users = lodash.flattenDeep(webinar.companies?.map(c => c.users))
    users.forEach(u => sendWebinarIn3Days({ user: u, title: webinar.name, datetime: formatDateTime(webinar.start_date) }).catch(console.error))
  })
})

// Staurdays reminders (1-4th in month)
cron.schedule('0 0 8 * * 6', async () => {
  const customers = await User.find({ role: ROLE_CUSTOMER })
  const saturdayIndex = Math.floor((moment().date() - 1) / 7) + 1
  const fn = { 1: sendSaturday1, 2: sendSaturday2, 3: sendSaturday3, 4: sendSaturday4 }[saturdayIndex]
  if (fn) {
    customers.forEach(customer => fn({ user: customer }).catch(console.error))
  }
})

/**
 * For each lead in coaching to come status, set to coaching converted
 * if his first appointment was today
 */
cron.schedule('0 0 1 * * *', async () => {
  const checkLead = email => {
    return User.findOne({ email })
      .populate({ path: 'coachings', populate: 'appointments' })
      .then(async user => {
        const hasFirstAppointment = await Appointment.exists({user, order:1, start_date: {$lte: moment()}})
        if (hasFirstAppointment) {
          return Lead.findOneAndUpdate({ email }, { coaching_converted: COACHING_CONVERSION_CONVERTED })
        }
        return Promise.resolve(false)
      })
      .then(res => !!res && `Lead ${email} coaching converted` || '')
  }
  return Lead.find({ coaching_converted: COACHING_CONVERSION_TO_COME })
    .then(leads => Promise.all(leads.map(lead => checkLead(lead.email))))
    .catch(console.error)
})

// Send reminder for user appointments
cron.schedule('0 0 10 * * *', async () => {
  const filter=getDateFilter({attribute: 'start_date', day: moment().add(1, 'day')})
  const appts=await Appointment.find(filter).populate(['diet', 'user']).catch(console.error)
  console.log('Appointments tomorrow reminders:', appts.length)
  await Promise.allSettled(appts.map(appt => sendAppointmentRemindTomorrow({appointment: appt})))
})

// Send notifications for all appointments finished yesterday without validation/rabbit
cron.schedule('0 0 10 * * *', async () => {
  const filter=getDateFilter({attribute: 'end_date', day: moment().add(-1, 'day')})
  const appts=await Appointment.find({...filter, validated: null}).populate(['diet', 'user']).catch(console.error)
  console.log('Not validated appointments', appts.map(a => a._id))
  await Promise.allSettled(appts.map(appt => sendAppointmentNotValidated({destinee: appt.diet, appointment: appt})))
})


module.exports = {
  ensureChallengePipsConsistency,
  logbooksConsistency,
  getRegisterCompany,
  agendaHookFn, mailjetHookFn,
  computeStatistics,
  canPatientStartCoaching,
  preProcessGetFORBIDDEN: preProcessGet,
}
