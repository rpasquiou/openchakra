const { loadFromDb } = require("../../utils/database")
const lodash = require('lodash')
const { ANSWER_NOT_APPLICABLE, ANSWER_YES, SCORE_LEVEL_3, SCORE_LEVEL_2, SCORE_LEVEL_1} = require("./consts")
const Score = require("../../models/Score")
const Question = require("../../models/Question")
const Answer = require("../../models/Answer")

// questionArray: [{question, answer}]
const computeScores = async (answers) => {

  let total_weight =0
  let total_rate = 0

  /*
  category_weightsAndRates: {category: {weight, rate}} 
  where weight is the sum of the weights of already cosnidered questions of that category 
  and rate is wieghts of those questions which answer is YES
  Same for bellwether_weightsAndRates but only for bellwether questions
  */

  //weightsAndRates is like category_weights or bellwether_weights
  const updateWeightsAndRates = (weightsAndRates, question,answer) => {
    const category = question.question_category._id.toString()
    const weight = question.weight

    if (!weightsAndRates[category]) {
      //category never met
      weightsAndRates[category] = {
        weight: weight, 
        rate: answer == ANSWER_YES ? weight : 0
      }
    } else {
      //current_category already met
      weightsAndRates[category] = {
        weight: weightsAndRates[category].weight + weight, 
        rate: weightsAndRates[category].rate + (answer == ANSWER_YES ? weight : 0)
      }
    }
  }

  let category_weightsAndRates={}
  let bellwether_weightsAndRates = {}

  lodash.forEach(answers, ({question, answer}) => {
    
    // If not applicable => question is not considered
    if (answer != ANSWER_NOT_APPLICABLE) {

      updateWeightsAndRates(category_weightsAndRates,question,answer)

      total_weight += question.weight
      total_rate += answer == ANSWER_YES ? question.weight : 0

      if (question.is_bellwether) {
        updateWeightsAndRates(bellwether_weightsAndRates,question,answer)
      }
    }
  })
    
  const global_rate = Math.round(total_rate / total_weight *100) /100

  const computeRates = (weightsAndRates) => {
    let result = [];     
    Object.entries(weightsAndRates).forEach(([key,value]) => {
      result.push({category: key, rate: Math.round(value.rate / value.weight *100) /100})
    })
    return result
  }

  const _category_rates = computeRates(category_weightsAndRates)
  const bellwether_rates = computeRates(bellwether_weightsAndRates)
    
  return {global_rate, _category_rates, bellwether_rates}
}

const computeScoresIfRequired = async (scoreId) => {
  const score = await loadFromDb({
    model: 'score',
    fields: [`answers.answer`, `answers.question.weight`, `answers.question.question_category`, `answers.question.is_bellwether`],
    id: scoreId
  })
  const completed = score[0].answers?.filter(a => !a.answer).length == 0
  
  if (completed) {
    const computedScores = await computeScores(score[0].answers)
    
    await Score.findByIdAndUpdate(score[0]._id, {$set: {...computedScores, completed}})
  }
}

const getQuestionsByCategory = async (userId, params, data) => {
  const groupedQuestions = lodash.groupBy(data.answers, (a) => a.question.question_category._id)
  const res = []
  lodash.forEach(groupedQuestions, (value,key) => {
    res.push({category: key, answers: value})
  })
  return res
}

const createScore = async (creatorId, scoreLevel) => {
  let acceptedLevels = []
  //deliberatly no breaks
  switch (scoreLevel) {
    case SCORE_LEVEL_3:
      acceptedLevels.push(SCORE_LEVEL_3)
    case SCORE_LEVEL_2:
      acceptedLevels.push(SCORE_LEVEL_2)
    case SCORE_LEVEL_1:
      acceptedLevels.push(SCORE_LEVEL_1)
  }

  const level_filtered = {min_level: {$in: acceptedLevels}}

  const questions = await Question.find(level_filtered)

  const answers=await Promise.all(questions.map(async q => {
    return Answer.create({question: q._id})
  }))

  return Score.create({creator: creatorId, completed: false, level: scoreLevel, answers: answers})
}

module.exports = {
  computeScoresIfRequired,
  getQuestionsByCategory,
  createScore
}