const { addAction, setAllowActionFn } = require('../../utils/studio/actions')
const Score = require("../../models/Score")
const lodash = require('lodash')
const { idEqual } = require('../../utils/database')
const { NotFoundError, ForbiddenError } = require('../../utils/errors')
const { createScore } = require('./score')
const { SCORE_LEVEL_1, ANSWERS, SCORE_LEVEL_3, SCORE_LEVEL_2, COIN_SOURCE_BEGINNER_DIAG, COIN_SOURCE_MEDIUM_DIAG, COIN_SOURCE_EXPERT_DIAG, COIN_SOURCE_WATCH } = require('./consts')
const User = require('../../models/User')
const Gain = require('../../models/Gain')


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
  return User.findByIdAndUpdate({_id: user._id}, {$set: {tokens: user.tokens + gain.gain}})
}
//TODO rename action to read_content
addAction('smartdiet_read_content', readContent)


const isActionAllowed = async ({action, dataId, user, ...rest}) => {
  if (lodash.includes(['smartdiet_next_question','smartdiet_finish_survey','previous_question'],action)) {

    const score = await Score.findOne({answers: dataId}).populate('answers')
    const answerIndex = lodash.findIndex(score.answers, (a)=> idEqual(a._id, dataId))
    
    if (action == 'smartdiet_next_question') {
      
      //if current answer is not answered
      if (!lodash.includes(ANSWERS,score.answers[answerIndex])) {
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
      if (!lodash.includes(ANSWERS,score.answers[answerIndex])) {
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
}

setAllowActionFn(isActionAllowed)