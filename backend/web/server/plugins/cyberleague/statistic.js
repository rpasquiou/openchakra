const lodash = require('lodash')
const Company = require("../../models/Company")
const Score = require("../../models/Score")
const User = require("../../models/User")
const { COMPANY_SIZE_1001_PLUS, STAT_MIN_SCORES, COMPANY_SIZE_0_10 } = require("./consts")


const regexSecurityIncidentManagement = (text) => {
  const regex = /.*gestion.*/ //Avez-vous une procédure de gestion des incidents de sécurité ?
  return regex.test(text)
}

const regexPartner = (text) => {
  const regex = /.*partenaire.*/ //Avez-vous identifié un partenaire spécialisé dans la réponse à incident de cybersécurité ?
  return regex.test(text)
}

const regexInventory = (text) => {
  const regex = /.*inventaire.*/ //Avez-vous un inventaire à jour de l'ensemble de vos actifs informatiques (matériels, logiciels, sites Web, nom de domaine, IP,... ) ?
  return regex.test(text)
}

const regexInsurance = (text) => {
  const regex = /.*assurance.*/ //Avez-vous une assurance cybersécurité ?
  return regex.test(text)
}

const regexCyberRef = (text) => {
  const regex = /.*référent.*/ //Avez-vous un responsable ou un référent cybersécurité ?
  return regex.test(text)
}

const regexIntrusion = (text) => {
  const regex = /.*intrusion.*/ //Effectuez-vous des tests d'intrusion sur votre SI ?
  return regex.test(text)
}

const regexExternalized = (text) => {
  const regex = /.*sauvegarde.*/ //Disposez-vous de sauvegarde hors-ligne ? (sur média indépendant délocalisé du lieu de production) ?
  return regex.test(text)
}

const regexWebApp = (text) => {
  const regex = /.*WAF.*/ //Vos sites web sont-ils protégés par des mécanismes de pare-feu applicatif (WAF) ?
  return regex.test(text)
}

const regexAntivirus = (text) => {
  const regex = /.*antivirus.*/ //Disposez-vous d'un antivirus de dernière génération (EDR/XDR, Analyse comportementale, Analyse mémoire) ?
  return regex.test(text)
}

const regexCharter = (text) => {
  const regex = /.*charte.*/ //Avez-vous diffusé une charte informatique à l'ensemble de vos collaborateurs ?
  return regex.test(text)
}

const regexFinancial = (text) => {
  const regex = /.*banques.*/ //Disposez-vous d’une procédure unique transverse ( pour toutes les banques) d’exécution des virements et/ou de changement d’IBAN  (montants autorisés France et international, plafonds cumulés, circuit de validation avec double regard (unitaire et en masse), ajout de bénéficiaire, etc) ?
  return regex.test(text)
}

const regexSensibilization = (text) => {
  const regex = /.*Sensibilisez.*/ //Sensibilisez-vous vos collaborateurs à la cybersécurité ?
  return regex.test(text)
}

const regexMFA = (text) => {
  const regex = /.*MFA.*/ //Avez-vous mis en place le MFA (Authentification Multifacteurs) pour les utilisateurs ?
  return regex.test(text)
}

const regexAdmin = (text) => {
  const regex = /.*admin.*/ //Interdisez-vous à vos collaborateurs d'être administrateurs de leurs postes ?
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
  const companyFilter = {}

  //Getting scores that will be used to do statistics
  let scores

  if (companyFilter != {}) {

    const companies = await Company.find(companyFilter)

    const users = await User.find({company: {$in: companies.map((c) => {return c._id})}})

    scores = await Score.find({creator: {$in: users.map((u) => {return u._id})}}).populate([
      {path: 'answers', populate: {path:'answer'}},
      {path: 'answers', populate: {path: 'question', $match: {is_bellwether: true}, populate: {path: 'text'}}}
    ])

  } else {
    scores = await Score.find()
  }

  let res = {
    securityIncidentManagement: 0,
    partner: 0,
    inventory: 0,
    insurance: 0,
    cyberRef: 0,
    intrusion: 0,
    externalized: 0,
    webApp: 0,
    antivirus: 0,
    charter: 0,
    financial: 0,
    sensibilization: 0,
    mfa: 0,
    admin: 0
  }

  //if less answers than STAT_MIN_SCORES stats are not relevant
  if (scores.length < STAT_MIN_SCORES) {
    //TODO return 'not enough scores to have relevant data'
  }

  // /!\ /!\ /!\ scores.answers.question in [question, undefined] -> undefined means question is not bellwether
  const cleanScores = scores.map((s)=> {
    s.answers = lodash.filter(s.answers,(a) => {
      return !!a.question 
    })
    return s
  })

  const bellwetherData = {
    securityIncidentManagement: {value: 0, count: 0},
    partner: {value: 0, count: 0},
    inventory: {value: 0, count: 0},
    insurance: {value: 0, count: 0},
    cyberRef: {value: 0, count: 0},
    intrusion: {value: 0, count: 0},
    externalized: {value: 0, count: 0},
    webApp: {value: 0, count: 0},
    antivirus: {value: 0, count: 0},
    charter: {value: 0, count: 0},
    financial: {value: 0, count: 0},
    sensibilization: {value: 0, count: 0},
    mfa: {value: 0, count: 0},
    admin: {value: 0, count: 0}
  }

  cleanScores.forEach((s)=> {
    s.answers.forEach((a) => {
      if (regexAntivirus(a.question.text)) {
        
      } else if (regexInsurance(a.question.text)) {
        
      } else if (regexCharter(a.question.text)) {
        
      } else if (regexInventory(a.question.text)) {
        
      } else if (regexCyberRef(a.question.text)) {
        
      } else if (regexExternalized(a.question.text)) {
        
      } else if (regexFinancial(a.question.text)) {

      } else if (regexIntrusion(a.question.text)) {

      } else if (regexPartner(a.question.text)) {
        
      } else if (regexSecurityIncidentManagement(a.question.text)) {
        
      } else if (regexSensibilization(a.question.text)) {
        
      } else if (regexWebApp(a.question.text)) {
        
      } else if (regexMFA(a.question.text)) {
        
      } else if (regexAdmin(a.question.text)) {
        
      } else {
        throw new Error(`La question '${a.question.text}' ne fait pas partie du baromètre`)
      }
    })
  })

  //Compute ratios for bellwether / benchmark
  res.forEach((_,k) => {
    res[k] = Math.round(bellwetherData[k].value / bellwetherData[k].count * 100) /100
  })

  return res
}

module.exports = {
  computeBellwetherStatistics
}