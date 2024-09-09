const { loadFromDb } = require("../../utils/database")
const lodash = require('lodash')
const { ANSWER_NOT_APPLICABLE, ANSWER_YES, SCORE_LEVEL_1, SCORE_LEVEL_3, SCORE_LEVEL_2 } = require("./consts")

// questionArray: [{question, answer}]
const computeScores = async (answerArray) => {

  let answers= await Promise.all(answerArray.map((a) => 
    loadFromDb({model: 'question', fields: ['weight', 'question_category', 'is_bellwether'], id: a.question._id})))
  
  answers=answers.map((elem, idx) => {
    return {question: elem[0], answer: answerArray[idx].answer}
  })

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
    
  const global_rate = total_rate / total_weight

  const computeRates = (weightsAndRates) => {
    let result = [];     
    Object.entries(weightsAndRates).forEach(([key,value]) => {
      result.push({question_category: key, category_rate: value.rate / value.weight})
    })
    return result
  }

  const category_rates = computeRates(category_weightsAndRates)
  const bellwether_rates = computeRates(bellwether_weightsAndRates)
    
  return {global_rate, category_rates, bellwether_rates}
}

const booleanLevelFieldName = (scoreLevel) => {
  switch (scoreLevel) {
    case SCORE_LEVEL_1:
      return `is_level_1`

    case SCORE_LEVEL_2:
      return `is_level_2`

    case SCORE_LEVEL_3:
      return `is_level_3`
  
    default:
      throw new Error(`Unknown score level`);
  }
}

module.exports = {
  computeScores,
  booleanLevelFieldName
}