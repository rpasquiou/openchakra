const { addAction, setAllowActionFn } = require('../../utils/studio/actions')
const Score = require('../../models/Score')
const lodash = require('lodash')
const { idEqual, getModel, loadFromDb } = require('../../utils/database')
const { NotFoundError, ForbiddenError, BadRequestError } = require('../../utils/errors')
const { createScore } = require('./score')
const { SCORE_LEVEL_1, ANSWERS, SCORE_LEVEL_3, SCORE_LEVEL_2, COIN_SOURCE_BEGINNER_DIAG, COIN_SOURCE_MEDIUM_DIAG, COIN_SOURCE_EXPERT_DIAG, COIN_SOURCE_WATCH, NOTIFICATION_TYPES, NOTIFICATION_TYPE_NEW_DIAG, ROLE_PARTNER, NOTE_TYPE_BEGINNER_DIAG, NOTE_TYPE_MEDIUM_DIAG, NOTE_TYPE_EXPERT_DIAG, ERR_IMPORT_DENIED, ROLE_ADMIN } = require('./consts')
const User = require('../../models/User')
const Gain = require('../../models/Gain')
const { isValidateNotificationAllowed, isDeleteUserNotificationAllowed, addNotification } = require('../notifications/actions')
const Company = require('../../models/Company')
const { addToLivefeed } = require('./adminDashboard')


const checkProfilCompletion = async ({ value }, user) => {
  //action used for isActionAllowed
  return {_id: value}
}
addAction('check_profil_completion', checkProfilCompletion)

const checkAuthorizedConversation = async ({ value }, user) => {
  //action used for isActionAllowed
  return {_id: value}
}
addAction('check_authorized_conversation', checkAuthorizedConversation)


const startSurvey = async (_, user) => {
  //console.log("params", params)

  //TODO récupérer le niveau du score : en attendant tous les scores sont niveau 1
  const level = SCORE_LEVEL_1

  const score = await createScore(user._id, level)

  return score.answers[0]
}
//TODO rename action to start_survey
addAction('smartdiet_start_survey', startSurvey)


const startSurvey2 = async (_, user) => {
  //console.log("params", params)

  //TODO récupérer le niveau du score : en attendant tous les scores sont niveau 1
  const level = SCORE_LEVEL_2

  const score = await createScore(user._id, level)

  return score.answers[0]
}
//TODO remove once start_survey take scorelevel into account
addAction('smartdiet_start_survey_2', startSurvey2)


const startSurvey3 = async (_, user) => {
  //console.log("params", params)

  //TODO récupérer le niveau du score : en attendant tous les scores sont niveau 1
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
  const company = await Company.findById(user.company)
  const noteCreationParams = {sector: company.sector, date: Date.now(), global_rate: score.global_rate}

  let gain
  switch (score.level) {
    case SCORE_LEVEL_1:
      gain = await Gain.findOne({source: COIN_SOURCE_BEGINNER_DIAG})
      noteCreationParams.type = NOTE_TYPE_BEGINNER_DIAG
      break;
    case SCORE_LEVEL_2:
      gain = await Gain.findOne({source: COIN_SOURCE_MEDIUM_DIAG})
      noteCreationParams.type = NOTE_TYPE_MEDIUM_DIAG
      break;
    case SCORE_LEVEL_3:
      gain = await Gain.findOne({source: COIN_SOURCE_EXPERT_DIAG})
      noteCreationParams.type = NOTE_TYPE_EXPERT_DIAG
      break;
  }
  await User.findByIdAndUpdate({_id: user._id}, {$set: {tokens: user.tokens + gain.gain}})

  //new scan notif
  if (user.company_sponsorship) {
    const sponsor = await Company.findById(user.company_sponsorship)
    await addNotification({
      users: sponsor.administrators,
      targetId: score._id,
      targetType: NOTIFICATION_TYPES[NOTIFICATION_TYPE_NEW_DIAG],
      type: NOTIFICATION_TYPE_NEW_DIAG,
      customData: JSON.stringify({customUserId: user._id}),
    })
  }

  await addToLivefeed(noteCreationParams)

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

  if (action == 'check_profil_completion') {
    if (!user.is_profil_completed) {
      throw new BadRequestError(`Action impossible tant que le profil n'est pas complété`)
    }
  }

  if (action == 'check_authorized_conversation') {
    const model = await getModel(dataId)
    if (model != 'user') {
      throw new BadRequestError(`Vous ne pouvez parler qu'à un user`)
    }
    if (!user.is_profil_completed) {
      throw new BadRequestError(`Action impossible tant que le profil n'est pas complété`)
    }
    const receiver = await User.findById(dataId)
    const receiverComp = receiver.role == ROLE_PARTNER ? receiver.company : receiver.company_sponsorship
    const userComp = user.role == ROLE_PARTNER ? receiver.company : receiver.company_sponsorship
    if (!idEqual(receiverComp, userComp)) {
      throw new ForbiddenError(`Vous ne pouvez parler à quelqu'un qui n'a pas le même partenaire que vous`)
    }
  }

  if (action=='import_model_data') {
    const company=await Company.findOne({_id: user.company, administrators: user})
    if (!company?.customer_id) {
      throw new Error(ERR_IMPORT_DENIED)
    }
  }

  if (['register', 'import_model_data'].includes(action)) {
    if (user.role!=ROLE_ADMIN) {
      // For import action, allow 'user' model only
      if (action=='import_model_data' && rest?.actionProps?.model!='user') {
        throw new Error(`Import modèle ${model} impossible`)
      }
      // Allow for company admins with registered companies only
      const [loaded]=await loadFromDb({model: 'user', id: user._id, fields: ['is_company_admin', 'company.customer_id']})
      if (!(loaded.is_company_admin && !!loaded.company.customer_id)) {
        throw new Error(ERR_IMPORT_DENIED)
      }
    }
  }

  return true
}

setAllowActionFn(isActionAllowed)