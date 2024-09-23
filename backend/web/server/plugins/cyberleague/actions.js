const { addAction } = require('../../utils/studio/actions')
const Score = require("../../models/Score")
const lodash = require('lodash')
const { idEqual } = require('../../utils/database')
const { NotFoundError } = require('../../utils/errors')
const { createScore } = require('./score')

//
const startSurvey = async (params, user) => {
  console.log("params", params)

  const firstQuestion = await createScore(user._id, params.level)

  return firstQuestion
}
//TODO rename action to start_survey
addAction('smartdiet_start_survey', startSurvey)


//value : _id of the answered question
const nextQuestion = async ({ value }, user) => {
  const score = await Score.findOne({answers: value}).populate('answers')
  const nextQuestionIndex = lodash.findIndex(score.answers, (a)=> idEqual(a._id, value)) + 1
  if (nextQuestionIndex == score.answers.length) {
    throw new NotFoundError(`Question ${value} is the last of the quiz`)
  }
  console.log('next Question', score.answers[nextQuestionIndex]);
  
  return score.answers[nextQuestionIndex]
}
//TODO rename action to next_question
addAction('smartdiet_next_question', nextQuestion)