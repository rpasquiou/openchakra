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

const MARKET_VALUES={
  'MANAGEMENT DE LA SECURITE ET GOUVERNANCE': 0.67,
  'FORMATION ET SENSIBILISATION A LA SECURITE':	0.78,
  'GESTION DES INCIDENTS DE SECURITE':	0.81,
  'GESTION DES ACTIFS ET DES TIERS':	0.78,
  "GESTION DE l'IDENTITE ET DES HABILITATIONS":	0.64,
  'JOURNALISATION ET SUPERVISION':	0.59,
  "SAUVEGARDE ET REPRISE D'ACTIVITE":	0.63,
  'CONFIDENTIALITE DES DONNEES':	0.6,
  'TRAITEMENT DES DONNEES PERSONNELLES':	0.69,
  'SECURITE PHYSIQUE':	0.72,
  "SECURITE DES RESEAUX ET DES ENVIRONNEMENTS D'ADMINISTRATION":	0.59,
  'PROTECTION ANTIVIRUS':	0.45,
  'SECURITE DES END POINTS (POSTES DE TRAVAIL ET TELEPHONES)'	:0.64,
  'VEILLE ET GESTION DES MISES A JOUR':	0.62,
  'SECURITE DES OPERATIONS BANCAIRES':	0.69,
  'SECURITE DES EQUIPEMENTS ET RESEAUX INDUSTRIELS (OT)':	0.46,
}
// questionArray: [{question, answer}]
const computeScores = async (answers) => {

  let total_weight =0
  let total_rate = 0

  /*
  category_weightsAndRates: {category: {weight, rate}} 
  where weight is the sum of the weights of already cosnidered questions of that category 
  and rate is wieghts of those questions which answer is YES
  */

  //weightsAndRates is like category_weights
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

  lodash.forEach(answers, ({question, answer}) => {
    
    // If not applicable => question is not considered
    if (answer != ANSWER_NOT_APPLICABLE) {

      updateWeightsAndRates(category_weightsAndRates,question,answer)

      total_weight += question.weight
      total_rate += answer == ANSWER_YES ? question.weight : 0
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

  return {global_rate, _category_rates}
}

const computeScoresIfRequired = async (scoreId) => {
  const score = await loadFromDb({
    model: 'score',
    fields: [`answers.answer`, `answers.question.weight`, `answers.question.question_category`],
    id: scoreId
  })
  const _completed = score[0].answers?.filter(a => !a.answer).length == 0
  
  if (_completed) {
    const computedScores = await computeScores(score[0].answers)
    
    await Score.findByIdAndUpdate(score[0]._id, {$set: {...computedScores, _completed}})
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
  const res = data._category_rates.map((elem) => {
    const name = elem.category.name
    const value = elem.rate
    const market_value = MARKET_VALUES[elem.category.name]
    return new Triple({name,value,market_value})
  })
  
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
      color: 'rgb(255,119,255)'
    }, {
      name:'Données du marché',
      values: labels.map(l => ({label: l, y: MARKET_VALUES[l]*100})),
      color: 'rgb(255,183,0)'
    }
  ]
  const res={labels, series}
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