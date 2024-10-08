const lodash = require('lodash')
const Company = require("../../models/Company")
const Score = require("../../models/Score")
const User = require("../../models/User")
const { STAT_MIN_SCORES } = require("./consts")


const regexTest = (field, text) => {
  const regex = {
    securityIncidentManagement: /.*gestion.*/, //Avez-vous une procédure de gestion des incidents de sécurité ?
    partner: /.*partenaire.*/, //Avez-vous identifié un partenaire spécialisé dans la réponse à incident de cybersécurité ?
    inventory: /.*inventaire.*/, //Avez-vous un inventaire à jour de l'ensemble de vos actifs informatiques (matériels, logiciels, sites Web, nom de domaine, IP,... ) ?
    insurance: /.*assurance.*/, //Avez-vous une assurance cybersécurité ?
    cyberRef: /.*référent.*/, //Avez-vous un responsable ou un référent cybersécurité ?
    intrusion: /.*intrusion.*/, //Effectuez-vous des tests d'intrusion sur votre SI ?
    externalized: /.*sauvegarde.*/, //Disposez-vous de sauvegarde hors-ligne ? (sur média indépendant délocalisé du lieu de production) ?
    webApp: /.*WAF.*/, //Vos sites web sont-ils protégés par des mécanismes de pare-feu applicatif (WAF) ?
    antivirus: /.*antivirus.*/, //Disposez-vous d'un antivirus de dernière génération (EDR/XDR, Analyse comportementale, Analyse mémoire) ?
    charter: /.*charte.*/, //Avez-vous diffusé une charte informatique à l'ensemble de vos collaborateurs ?
    financial: /.*banques.*/, //Disposez-vous d’une procédure unique transverse ( pour toutes les banques) d’exécution des virements et/ou de changement d’IBAN  (montants autorisés France et international, plafonds cumulés, circuit de validation avec double regard (unitaire et en masse), ajout de bénéficiaire, etc) ?
    sensibilization: /.*Sensibilisez.*/, //Sensibilisez-vous vos collaborateurs à la cybersécurité ?
    mfa: /.*MFA.*/, //Avez-vous mis en place le MFA (Authentification Multifacteurs) pour les utilisateurs ?
    admin: /.*admin.*/ //Interdisez-vous à vos collaborateurs d'être administrateurs de leurs postes ?
  }
  return regex[field].test(text)
}

const getIncreaseValue = (field, answer) => {
  //tester en fonction de si on veut answer_yes ou answer_no selon le champ
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

  const fields = [
    `securityIncidentManagement`,
    `partner`,
    `inventory`,
    `insurance`,
    `cyberRef`,
    `intrusion`,
    `externalized`,
    `webApp`,
    `antivirus`,
    `charter`,
    `financial`,
    `sensibilization`,
    `mfa`,
    `admin`
  ]

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
      fields.forEach((field) => {
        if (regexTest(field,a.question.text)) {
          increaseValueCount(bellwetherData, field, getIncreaseValue(field, a.answer))
        }
      })
    })
  })

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

  //Compute ratios for bellwether / benchmark
  res.forEach((_,k) => {
    res[k] = Math.round(bellwetherData[k].value / bellwetherData[k].count * 100) /100
  })

  return res
}

module.exports = {
  computeBellwetherStatistics
}