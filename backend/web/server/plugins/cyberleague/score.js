const { loadFromDb, idEqual } = require("../../utils/database")
const lodash = require('lodash')
const { ANSWER_NOT_APPLICABLE, ANSWER_YES, SCORE_LEVEL_3, SCORE_LEVEL_2, SCORE_LEVEL_1, ROLE_ADMIN} = require("./consts")
const Score = require("../../models/Score")
const Question = require("../../models/Question")
const Answer = require("../../models/Answer")
const User = require("../../models/User")
const Triple = require("../../models/Triple")
const CategoryRate = require("../../models/CategoryRate")
const ChartData = require("../../models/ChartData")

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

  const computeRates = async (weightsAndRates) => {   
    return Promise.all(Object.entries(weightsAndRates).map(async ([key,value]) => {
      const catRate = await CategoryRate.create({category: key, rate: Math.round(value.rate / value.weight *100) /100})
      return catRate._id
    }))
  }

  const _category_rates = await computeRates(category_weightsAndRates)
  const bellwether_rates = []//computeRates(bellwether_weightsAndRates)

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

const getCategoryRates = async (userId, params, data) => {
  data= await Score.findById(data._id)
    .populate({path: '_category_rates', populate:'category'})
  const market = await Score.findOne({_market: true}).populate(['_category_rates.name','_category_rates._id'])
  const res = data._category_rates.map((elem) => {
    const name = elem.category.name
    const value = elem.rate
    const market_value = null
    return new Triple({name,value,market_value})
  })
  console.log("category_rates",res);
  
  return res
}

const getChartData = async (userId, params, data) => {
  data= await Score.findById(data._id)
    .populate({path: '_category_rates', populate:'category'})
  const myData = []
  const labels = data._category_rates.map((elem) => {
   
    myData.push({label: elem.category.name, y: elem.rate*100})
    return elem.category.name
  })
  const series=[{
    name:'Mes données',
    values: myData,
    color: 'rgb(255,0,0)'
  },]
  const res={labels, series}
  console.log(JSON.stringify(res, null, 2))
  return new ChartData(res)
}

const updateMarketScore = async (_category_rates) => {
  const marketScore = await Score.findOne({_market: true})
  //if no market score we create one
  if (!marketScore) {
    const admin = await User.findOne({role: ROLE_ADMIN})
    return Score.create({creator: admin._id, _market: true, _category_rates: _category_rates, level: SCORE_LEVEL_1})
  }
  //if there is a market score we update only if _category_rates is not null
  if (!_category_rates) {
    return Promise.resolve()
  } else {
    Score.findOneAndUpdate({_market: true}, {_category_rates: _category_rates})
  }

}

module.exports = {
  computeScoresIfRequired,
  getQuestionsByCategory,
  createScore,
  getCategoryRates,
  updateMarketScore,
  getChartData,
}