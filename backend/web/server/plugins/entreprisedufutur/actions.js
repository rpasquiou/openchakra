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


const generateOrder = async ({value,nb_tickets}, user) => {

  if (!value) {
    throw new NotFoundError(`no eventTicket id`)
  }

  if (!testNumber(nb_tickets)) {
    throw new TypeError(`nb_tickets is not a number`)
  }

  const order = await Order.create({eventTicket: value, status: ORDER_STATUS_IN_PROGRESS})

  const eventTicket = await EventTicket.findById(value, ['remaining_tickets'])
  const remaining_tickets = eventTicket.remaining_tickets

  for (let i = 0; i < nb_tickets; i++) {
    const status = i<remaining_tickets ? USERTICKET_STATUS_REGISTERED : USERTICKET_STATUS_WAITING_LIST
    if (i == 1) {
      await OrderTicket.create({order: order._id, status, firstname: user.firstname, latname: user.lastname, email: user.email})
    } else {
      await OrderTicket.create({order: order._id, status})
    }
  }
  return value
}
addAction('generate_order', generateOrder)


const validateOrder = async ({value}, user) => {

  if (!value) {
    throw new NotFoundError(`no command id`)
  }

  const [order] = await loadFromDb({
    model: 'order',
    fields: ['order_tickets.firstname', 'order_tickets.lastname', 'order_tickets.email', 'order_tickets.status','event_ticket'],
    id: value,
  })

  const knownUserTickets = await order.order_tickets.filter(async (t) => {
    const user = await User.findOne({email:t.email})
    return !!user
  })

  //Check that known users don't already have a ticket
  knownUserTickets.forEach(async (orderTicket) => {
    const user = await User.findOne({email:orderTicket.email})
    const ticket = UserTicket.findOne({user: user._id, event_ticket: order.event_ticket})
    if (!!ticket) {
      throw new ForbiddenError(`Un billet a déjà été pris pour cette événement avec l'email ${orderTicket.email}`)
    }
  })

  const unknownUserTickets = lodash.differenceWith(
    order.order_tickets,
    knownUserTickets,
    (o,k) =>{
      return idEqual(o._id,k._id)
    }
  )

  //New user creation from emails
  unknownUserTickets.foreach(async (orderTicket) => {
    const password = generatePassword()
    await ACTIONS.register({
      firstname: orderTicket.firstname,
      lastname: orderTicket.lastname,
      email: orderTicket.email,
      role: ROLE_MEMBER, password,
      password2: password},
      user
    )
  })

  //UserTicket creations
  const eventTicket = await EventTicket.findById(order.event_ticket, ['remaining_tickets'])
  const remaining_tickets = eventTicket.remaining_tickets

  order.order_tickets.map(async (orderTicket,index) => {
    const user = await User.findOne({email:orderTicket.email})
    //synchro ???
    const status = index < remaining_tickets ? USERTICKET_STATUS_REGISTERED : USERTICKET_STATUS_WAITING_LIST
    await UserTicket.create({event_ticket: order.event_ticket, user: user._id, status: status})
  })

  //order status update
  await Order.findByIdAndUpdate(order._id, {status: ORDER_STATUS_VALIDATED})

  return value
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

  return true
}

setAllowActionFn(isActionAllowed)