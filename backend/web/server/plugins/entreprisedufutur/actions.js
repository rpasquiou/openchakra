const { addAction, setAllowActionFn, ACTIONS } = require('../../utils/studio/actions')
const Score = require('../../models/Score')
const lodash = require('lodash')
const { idEqual, getModel, loadFromDb } = require('../../utils/database')
const { NotFoundError, ForbiddenError } = require('../../utils/errors')
const { createScore } = require('./score')
const { SCORE_LEVEL_1, ANSWERS, SCORE_LEVEL_3, SCORE_LEVEL_2, COIN_SOURCE_BEGINNER_DIAG, COIN_SOURCE_MEDIUM_DIAG, COIN_SOURCE_EXPERT_DIAG, COIN_SOURCE_WATCH, ORDER_STATUS_IN_PROGRESS, USERTICKET_STATUS_REGISTERED, USERTICKET_STATUS_WAITING_LIST, ORDER_STATUS_VALIDATED, ROLE_MEMBER } = require('./consts')
const User = require('../../models/User')
const Gain = require('../../models/Gain')
const { isValidateNotificationAllowed, isDeleteUserNotificationAllowed } = require('../notifications/actions')
const Table = require('../../models/Table')
const Event = require('../../models/Event')
const EventTicket = require('../../models/EventTicket')
const OrderTicket = require('../../models/OrderTicket')
const Order = require('../../models/Order')
const UserTicket = require('../../models/UserTicket')
const { generatePassword } = require('../../../utils/passwords')

//TODO take scoreLevel into account
const startSurvey = async (_, user) => {
  //console.log("params", params)

  const level = SCORE_LEVEL_1

  const score = await createScore(user._id, level)

  return score.answers[0]
}
//TODO rename action to start_survey
addAction('smartdiet_start_survey', startSurvey)


const startSurvey2 = async (_, user) => {
  //console.log("params", params)

  const level = SCORE_LEVEL_2

  const score = await createScore(user._id, level)

  return score.answers[0]
}
//TODO remove once start_survey take scorelevel into account
addAction('smartdiet_start_survey_2', startSurvey2)


const startSurvey3 = async (_, user) => {
  //console.log("params", params)

  const level = SCORE_LEVEL_3

  const score = await createScore(user._id, level)

  return score.answers[0]
}
//TODO remove once start_survey take scorelevel into account
addAction('smartdiet_start_survey_3', startSurvey3)


//value : _id of the answered question
const nextQuestion = async ({ value }, user) => {
  const score = await Score.findOne({answers: value}).populate('answers')
  
  const answerIndex = lodash.findIndex(score.answers, (a)=> idEqual(a._id, value))
  if (answerIndex +1 == score.answers.length) {
    throw new NotFoundError(`Answer ${value} is the last of the quiz`)
  }

  return score.answers[answerIndex +1]
}
//TODO rename action to next_question
addAction('smartdiet_next_question', nextQuestion)


const finishSurvey = async ({ value }, user) => {
  const score = await Score.findOne({answers: value}).populate('answers')
  let gain
  switch (score.level) {
    case SCORE_LEVEL_1:
      gain = await Gain.findOne({source: COIN_SOURCE_BEGINNER_DIAG})
      break;
    case SCORE_LEVEL_2:
      gain = await Gain.findOne({source: COIN_SOURCE_MEDIUM_DIAG})
      break;
    case SCORE_LEVEL_3:
      gain = await Gain.findOne({source: COIN_SOURCE_EXPERT_DIAG})
      break;
  }
  await User.findByIdAndUpdate({_id: user._id}, {$set: {tokens: user.tokens + gain.gain}})
  return score
}
//TODO rename action to finish_survey
addAction('smartdiet_finish_survey', finishSurvey)


//value : _id of the answered question
const previousQuestion = async ({ value }, user) => {
  const score = await Score.findOne({answers: value}).populate('answers')
  
  const answerIndex = lodash.findIndex(score.answers, (a)=> idEqual(a._id, value))
  if (answerIndex == 0) {
    throw new NotFoundError(`Answer ${value} is the first of the quiz`)
  }
  
  return score.answers[answerIndex -1]
}
addAction('previous_question', previousQuestion)


const readContent = async ({ value }, user) => {
  const gain = await Gain.findOne({source: COIN_SOURCE_WATCH})
  await User.findByIdAndUpdate({_id: user._id}, {$set: {tokens: user.tokens + gain.gain}})
  return value
}
//TODO rename action to read_content
addAction('smartdiet_read_content', readContent)


const testNumber = (value) => {
  const nbRegex = new RegExp (`^[0-9]*$`)
  return nbRegex.test(value)
}

const generateTables = async ({value, nb_seats, nb_tables}, user) => {
  
  if (!value) {
    throw new NotFoundError(`no tablemap id`)
  }

  if (!testNumber(nb_seats)) {
    throw new TypeError(`nb_seats is not a number`)
  }

  if (!testNumber(nb_tables)) {
    throw new TypeError(`nb_tables is not a number`)
  }

  const event = await Event.findById(value, ['tablemap'])

  for (let i = 0; i < nb_tables; i++) {
    await Table.create({tablemap: event.tablemap, capacity: nb_seats})
  }
  return value
}
addAction('generate_tables', generateTables)


const generateOrder = async ({value,nb_tickets: nb_tickets_str}, user) => {

  const nb_tickets = parseInt(nb_tickets_str)

  if (!value) {
    throw new NotFoundError(`no eventTicket id`)
  }

  const model = await getModel(value)
  if (model != 'eventTicket') {
    throw new TypeError(`value type is ${model} instead of eventTicket`)
  }

  if (!testNumber(nb_tickets)) {
    throw new TypeError(`nb_tickets is not a number`)
  }

  //loggedUser have bought less than quantity_max_per_user tickets
  const boughtNumber = await UserTicket.countDocuments({buyer: user._id, event_ticket:value})
  const eventTicket = await EventTicket.findById(value, ['remaining_tickets', 'quantity_max_per_user'])
  if (nb_tickets + boughtNumber> eventTicket.quantity_max_per_user) {
    throw new ForbiddenError(`Le nombre de billets de cette catégorie achetés par une même personne ne peut pas dépasser ${eventTicket.quantity_max_per_user}, vous en avez acheté ${nb_tickets + boughtNumber}`)
  }

  const order = await Order.create({event_ticket: value, status: ORDER_STATUS_IN_PROGRESS})

  const remaining_tickets = eventTicket.remaining_tickets

  for (let i = 0; i < nb_tickets; i++) {
    const status = i<remaining_tickets ? USERTICKET_STATUS_REGISTERED : USERTICKET_STATUS_WAITING_LIST
    if (i == 0) {
      await OrderTicket.create({order: order._id, status, firstname: user.firstname, lastname: user.lastname, email: user.email})
    } else {
      await OrderTicket.create({order: order._id, status})
    }
  }
  return order
}
addAction('generate_order', generateOrder)


const validateOrder = async ({value}, user) => {

  if (!value) {
    throw new NotFoundError(`no command id`)
  }

  const [order] = await loadFromDb({
    model: 'order',
    fields: ['order_tickets.firstname', 'order_tickets.lastname', 'order_tickets.email', 'order_tickets.status','event_ticket.remaining_tickets', 'event_ticket.event'],
    id: value,
  })

  const obj = lodash.countBy(order.order_tickets, (v)=> v.email)
  lodash.map(obj, (v,k)=> {
    if (v>1) {
      throw new ForbiddenError(`Un seul email ne peut être utilisé pour plusieurs billets`)
    }
  })

  const event = await Event.findById(order.event_ticket.event._id)

  await Promise.all(order.order_tickets.map(async (orderTicket) => {
    const userF = await User.findOne({email:orderTicket.email})
    if (!!userF) {//Check that known users don't already have a ticket
      const ticket = UserTicket.findOne({user: userF._id, event_ticket: {$in: event.event_tickets}})
      if (!!ticket) {
        throw new ForbiddenError(`Un billet a déjà été pris pour cet événement avec l'email ${orderTicket.email}`)
      }
    } else {//New user creation from unknown emails
      const password = generatePassword()
      await ACTIONS.register({
        firstname: orderTicket.firstname,
        lastname: orderTicket.lastname,
        email: orderTicket.email,
        role: ROLE_MEMBER, password,
        password2: password},
        user
      )
    }
  }))

  //UserTicket creations
  const remaining_tickets = order.event_ticket.remaining_tickets

  await Promise.all(order.order_tickets.map(async (orderTicket,index) => {
    const userL = await User.findOne({email: orderTicket.email})
    const status = index < remaining_tickets ? USERTICKET_STATUS_REGISTERED : USERTICKET_STATUS_WAITING_LIST
    return UserTicket.create({event_ticket: order.event_ticket.id, user: userL._id, status: status, buyer: user._id})
  }))
  
  //order status update
  await Order.findByIdAndUpdate(order._id, {status: ORDER_STATUS_VALIDATED})
  
  return event
}
addAction('validate_order', validateOrder)


const isActionAllowed = async ({action, dataId, user, ...rest}) => {
  if (lodash.includes(['smartdiet_next_question','smartdiet_finish_survey','previous_question'],action)) {

    const score = await Score.findOne({answers: dataId}).populate('answers')
    const answerIndex = lodash.findIndex(score.answers, (a)=> idEqual(a._id, dataId))
    
    if (action == 'smartdiet_next_question') {
      
      //if current answer is not answered
      if (!lodash.includes(lodash.keys(ANSWERS),score.answers[answerIndex].answer)) {
        throw new ForbiddenError(`Il faut répondre à la question avant de pouvoir passer à la suivante`)
      }
      
      //if no other answers
      if (answerIndex + 1 == score.answers.length) {
        throw new NotFoundError(`Il n'y a pas de question suivante`)
      }
    }
    
    if (action == 'smartdiet_finish_survey') {
      //if not the last answer
      if (answerIndex < score.answers.length -1) {
        throw new ForbiddenError(`Ce n'est pas la dernière question`)
      }

      //if current answer is not answered
      if (!lodash.includes(lodash.keys(ANSWERS),score.answers[answerIndex].answer)) {
        throw new ForbiddenError(`Il faut répondre à la question avant de pouvoir terminer le questionnaire`)
      }
    }
    
    if (action == 'previous_question') {
      //if first answer
      if (answerIndex == 0) {
        throw new NotFoundError(`Il n'y a pas de question précédente`)
      }
    }
  }

  if (action == 'validate') {
    const model = await getModel(dataId)
    if (model == 'notification') {
      await isValidateNotificationAllowed({dataId, user, ...rest})
    } else {
      throw new Error(`No validate action for model ${model}`)
    }
  }

  if(action == 'delete') {
    const model = await getModel(dataId)
    if (model == 'notification') {
      await isDeleteUserNotificationAllowed({dataId, user, ...rest})
    } else {
      throw new ForbiddenError(`Deleting is forbidden for model ${model}`)
    }
  }

  if (action == 'generate_order') {
    const dataIdModel = await getModel(dataId)
    if (dataIdModel != 'eventTicket') {
      throw new Error(`DataId is a ${dataIdModel} id instead of an eventTicket one`)
    }
  }

  return true
}

setAllowActionFn(isActionAllowed)