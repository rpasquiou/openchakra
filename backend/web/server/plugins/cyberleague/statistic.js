const lodash = require('lodash')
const Company = require("../../models/Company")
const Score = require("../../models/Score")
const User = require("../../models/User")
const { COMPANY_SIZE_1001_PLUS, STAT_MIN_SCORES, COMPANY_SIZE_0_10 } = require("./consts")


const regexSecurityIncident = (text) => {
  return false
}

const regexLeakage = (text) => {
  return false
}

const regexCriticalIncident = (text) => {
  return false
}

const regexBudget = (text) => {
  const regex = /.*assurance.*|.*incident.*|.*partenaire.*/
  return regex.test(text)
}

const regexCyberRef = (text) => {
  const regex = /.*référent.*/
  return regex.test(text)
}

const regexIntrusion = (text) => {
  const regex = /.*intrusion.*/
  return regex.test(text)
}

const regexExternalized = (text) => {
  const regex = /.*sauvegarde.*/
  return regex.test(text)
}

const regexWebApp = (text) => {
  const regex = /.*WAF.*/
  return regex.test(text)
}

const regexAntivirus = (text) => {
  const regex = /.*antivirus.*/
  return regex.test(text)
}

const regexCharter = (text) => {
  const regex = /.*charte.*/
  return regex.test(text)
}

const regexFinancial = (text) => {
  const regex = /.*banques.*/
  return regex.test(text)
}

const regexSensibilization = (text) => {
  const regex = /.*Sensibilisez.*/
  return regex.test(text)
}

const increaseValueCount = (data, field, increaseValue) => {
  data[field].count += 1
  if (increaseValue) {
    data[field].value += 1
  }
}

const computeBellwetherStatistics = async (filters) => {
  //TODO take filters into account (company sector, region, size)
  const companyFilter = {size: {$nin: [COMPANY_SIZE_1001_PLUS, COMPANY_SIZE_0_10]}}

  //Getting scores that will be used to do statistics
  const companies = await Company.find(companyFilter)

  const users = await User.find({company: {$in: companies.map((c) => {return c._id})}})

  const scores = await Score.find({creator: {$in: users.map((u) => {return u._id})}}).populate([
    {path: 'answers', populate: {path:'answer'}},
    {path: 'answers', populate: {path: 'question', $match: {is_bellwether: true}, populate: {path: 'text'}}}
  ])

  //if less answers than STAT_MIN_SCORES stats are not relevant
  if (scores.length < STAT_MIN_SCORES) {
    //TODO
  }

  // /!\ /!\ /!\ scores.answers.question in [question, undefined] -> undefined means answer is not bellwether
  const cleanScores = scores.map((s)=> {
    s.answers = lodash.filter(s.answers,(a) => {
      return !a.question 
    })
    return s
  })

  const bellwetherData = {
    threatSecurityIncident: {value: 0, count: 0},
    threatSecurityIncidentETI: {value: 0, count: 0},
    threatLeakage: {value: 0, count: 0},
    threatCriticalIncident: {value: 0, count: 0},
    maturityBudget: {value: 0, count: 0},
    maturityBudgetPME: {value: 0, count: 0},
    maturityCyberRef: {value: 0, count: 0},
    protectionIntrusion: {value: 0, count: 0},
    protectionIntrusionPME: {value: 0, count: 0},
    protectionIntrusionETI: {value: 0, count: 0},
    protectionExternalized: {value: 0, count: 0},
    protectionWebApp: {value: 0, count: 0},
    protectionWebAppPME: {value: 0, count: 0},
    protectionWebAppETI: {value: 0, count: 0},
    protectionAntivirus: {value: 0, count: 0},
    practicesCharter: {value: 0, count: 0},
    practicesFinancial: {value: 0, count: 0},
    practicesSensibilization: {value: 0, count: 0}
  }

  cleanScores.forEach((s)=> {
    s.answers.forEach((a) => {
      if (regexAntivirus(a.question.text)) {
        
      } else if (regexBudget(a.question.text)) {
        // 3 questions for this one
        // need to check if PME
        
      } else if (regexCharter(a.question.text)) {
        
      } else if (regexCriticalIncident(a.question.text)) {
        
      } else if (regexCyberRef(a.question.text)) {
        
      } else if (regexExternalized(a.question.text)) {
        
      } else if (regexFinancial(a.question.text)) {

      } else if (regexIntrusion(a.question.text)) {
        // need to check if PME or ETI

      } else if (regexLeakage(a.question.text)) {
        
      } else if (regexSecurityIncident(a.question.text)) {
        // need to check if ETI
        
      } else if (regexSensibilization(a.question.text)) {
        
      } else if (regexWebApp(a.question.text)) {
        // need to check if PME or ETI
        
      } else {
        throw new Error(`La question '${a.question.text}' ne fait pas partie du baromètre`)
      }
    })
  })
}

module.exports = {
  computeBellwetherStatistics
}