const lodash=require('lodash')
const { SS_MEDALS_BRONZE, SS_MEDALS_GOLD, SS_MEDALS_SILVER, SS_PILAR, SS_PILAR_COORDINATOR, SS_PILAR_CREATOR, 
  SS_PILAR_DIRECTOR, SS_PILAR_IMPLEMENTOR, SS_PILAR_NETWORKER, SS_PILAR_OPTIMIZER, SOFT_SKILLS, SOFT_SKILL_ADAPTATION, 
  SOFT_SKILL_ANALYSIS, SOFT_SKILL_CHANGE, SOFT_SKILL_COMM, SOFT_SKILL_CONFLICT, SOFT_SKILL_CREATIVE, SOFT_SKILL_FEDERATE, 
  SOFT_SKILL_MANAGE, SOFT_SKILL_ORGANIZATION, SOFT_SKILL_TEAMWORK } =require('./consts')
const SoftSkill = require('../../models/SoftSkill')


// Matrix mapping (theme, medal) to a pilier
const MATRIX={}

const setMatrixMedal = (theme, pilier, medal) => {
  lodash.set(MATRIX, `${theme}.${pilier}`, medal)
}

function getMedalAt(theme, pilier) {
  return lodash.get(MATRIX, `${theme}.${pilier}`)
}

const isMedalAt = (theme, pilier, medal) => {
  return getMedalAt(theme, pilier)==medal
}

setMatrixMedal(SOFT_SKILL_COMM, SS_PILAR_CREATOR, SS_MEDALS_BRONZE)
setMatrixMedal(SOFT_SKILL_COMM, SS_PILAR_IMPLEMENTOR, SS_MEDALS_BRONZE)
setMatrixMedal(SOFT_SKILL_COMM, SS_PILAR_NETWORKER, SS_MEDALS_SILVER)
setMatrixMedal(SOFT_SKILL_COMM, SS_PILAR_COORDINATOR, SS_MEDALS_BRONZE)
setMatrixMedal(SOFT_SKILL_TEAMWORK, SS_PILAR_CREATOR, SS_MEDALS_BRONZE)
setMatrixMedal(SOFT_SKILL_TEAMWORK, SS_PILAR_IMPLEMENTOR, SS_MEDALS_SILVER)
setMatrixMedal(SOFT_SKILL_TEAMWORK, SS_PILAR_NETWORKER, SS_MEDALS_SILVER)
setMatrixMedal(SOFT_SKILL_TEAMWORK, SS_PILAR_COORDINATOR, SS_MEDALS_SILVER)
setMatrixMedal(SOFT_SKILL_TEAMWORK, SS_PILAR_DIRECTOR, SS_MEDALS_BRONZE)
setMatrixMedal(SOFT_SKILL_CONFLICT, SS_PILAR_OPTIMIZER, SS_MEDALS_BRONZE)
setMatrixMedal(SOFT_SKILL_CONFLICT, SS_PILAR_NETWORKER, SS_MEDALS_BRONZE)
setMatrixMedal(SOFT_SKILL_CONFLICT, SS_PILAR_COORDINATOR, SS_MEDALS_BRONZE)
setMatrixMedal(SOFT_SKILL_CONFLICT, SS_PILAR_DIRECTOR, SS_MEDALS_BRONZE)
setMatrixMedal(SOFT_SKILL_CHANGE, SS_PILAR_CREATOR, SS_MEDALS_SILVER)
setMatrixMedal(SOFT_SKILL_CHANGE, SS_PILAR_IMPLEMENTOR, SS_MEDALS_BRONZE)
setMatrixMedal(SOFT_SKILL_CHANGE, SS_PILAR_COORDINATOR, SS_MEDALS_BRONZE)
setMatrixMedal(SOFT_SKILL_CHANGE, SS_PILAR_DIRECTOR, SS_MEDALS_SILVER)
setMatrixMedal(SOFT_SKILL_FEDERATE, SS_PILAR_CREATOR, SS_MEDALS_BRONZE)
setMatrixMedal(SOFT_SKILL_FEDERATE, SS_PILAR_OPTIMIZER, SS_MEDALS_BRONZE)
setMatrixMedal(SOFT_SKILL_FEDERATE, SS_PILAR_NETWORKER, SS_MEDALS_GOLD)
setMatrixMedal(SOFT_SKILL_FEDERATE, SS_PILAR_DIRECTOR, SS_MEDALS_SILVER)
setMatrixMedal(SOFT_SKILL_CREATIVE, SS_PILAR_CREATOR, SS_MEDALS_GOLD)
setMatrixMedal(SOFT_SKILL_CREATIVE, SS_PILAR_OPTIMIZER, SS_MEDALS_SILVER)
setMatrixMedal(SOFT_SKILL_CREATIVE, SS_PILAR_NETWORKER, SS_MEDALS_BRONZE)
setMatrixMedal(SOFT_SKILL_ADAPTATION, SS_PILAR_IMPLEMENTOR, SS_MEDALS_GOLD)
setMatrixMedal(SOFT_SKILL_ADAPTATION, SS_PILAR_OPTIMIZER, SS_MEDALS_SILVER)
setMatrixMedal(SOFT_SKILL_ADAPTATION, SS_PILAR_NETWORKER, SS_MEDALS_BRONZE)
setMatrixMedal(SOFT_SKILL_ANALYSIS, SS_PILAR_CREATOR, SS_MEDALS_SILVER)
setMatrixMedal(SOFT_SKILL_ANALYSIS, SS_PILAR_IMPLEMENTOR, SS_MEDALS_BRONZE)
setMatrixMedal(SOFT_SKILL_ANALYSIS, SS_PILAR_OPTIMIZER, SS_MEDALS_GOLD)
setMatrixMedal(SOFT_SKILL_ORGANIZATION, SS_PILAR_IMPLEMENTOR, SS_MEDALS_SILVER)
setMatrixMedal(SOFT_SKILL_ORGANIZATION, SS_PILAR_OPTIMIZER, SS_MEDALS_BRONZE)
setMatrixMedal(SOFT_SKILL_ORGANIZATION, SS_PILAR_COORDINATOR, SS_MEDALS_GOLD)
setMatrixMedal(SOFT_SKILL_ORGANIZATION, SS_PILAR_DIRECTOR, SS_MEDALS_BRONZE)
setMatrixMedal(SOFT_SKILL_MANAGE, SS_PILAR_COORDINATOR, SS_MEDALS_SILVER)
setMatrixMedal(SOFT_SKILL_MANAGE, SS_PILAR_DIRECTOR, SS_MEDALS_GOLD)

const computeGold = (medals) => {
  const gold=lodash(medals).pickBy((v, k) => v==SS_MEDALS_GOLD).value()
  const themes=Object.keys(gold)
  let result={}
  themes.forEach(theme => {
    Object.keys(SS_PILAR).forEach(pilier => {
      if (isMedalAt(theme, pilier, SS_MEDALS_GOLD)) {
        result[pilier]=(result[pilier]||0)+10
      }
    })
  })
  return result
}

const computeSilver = (medals) => {
  const silver=lodash(medals).pickBy((v, k) => v==SS_MEDALS_SILVER).value()
  const themes=Object.keys(silver)
  let result={}
  themes.forEach(theme => {
    Object.keys(SS_PILAR).forEach(pilier => {
      if (isMedalAt(theme, pilier, SS_MEDALS_SILVER)) {
        result[pilier]=(result[pilier]||0)+5
      }
    })
  })
  return result
}

const computeBronze = (medals) => {
  const bronze=lodash(medals).pickBy((v, k) => v==SS_MEDALS_BRONZE).value()
  const themes=Object.keys(bronze)
  let result={}
  themes.forEach(theme => {
    Object.keys(SS_PILAR).forEach(pilier => {
      if (isMedalAt(theme, pilier, SS_MEDALS_BRONZE)) {
        result[pilier]=(result[pilier]||0)+3
      }
    })
  })
  return result
}

// Add 1 point for each pilier where both theme and customer themes are ampty
const computeEmpty = (medals) => {
  const emptyThemes=lodash.difference(Object.keys(SOFT_SKILLS), Object.keys(medals))
  let result={}
  Object.keys(SS_PILAR).forEach(pilier => {
    emptyThemes.forEach(theme => {
      if (!getMedalAt(theme, pilier)) {
        result[pilier]=(result[pilier]||0)+1
      }
    })
  })
  return result
}

const computeActivated = medals => {
  // 5 points on each pilier who have the same medals
  let result={}
  Object.keys(SS_PILAR).forEach(pilier => {
    let count=0
    Object.keys(medals).forEach(theme => {
      const userMedal=medals[theme]
      const matrixMedal=getMedalAt(theme, pilier)
      if (userMedal && userMedal==matrixMedal) {
        count+=1
      }
    })
    if (count>=3) {
      result[pilier]=(result[pilier]||0)+5
    }
  })
  Object.keys(SS_PILAR).forEach(pilier => {
    let count=0
    Object.entries(medals)
      .filter(([_, medal]) => medal!=SS_MEDALS_GOLD)
      .forEach(([theme, userMedal]) => {
        const matrixMedal=getMedalAt(theme, pilier)
        if (userMedal && userMedal==matrixMedal) {
          count+=1
        }
    })
    if (count>=3) {
      result[pilier]=(result[pilier]||0)+5
    }
  })
  return result
}

const computePilars = medals =>  {
  let result=Object.fromEntries(Object.keys(SS_PILAR).map(k => [k, 0]))
  const gold=computeGold(medals)
  const silver=computeSilver(medals)
  const bronze=computeBronze(medals)
  const empty=computeEmpty(medals)
  const activated=computeActivated(medals)
  Object.keys(SS_PILAR).forEach(pilier => {
    const total=lodash([gold, silver, bronze, empty, activated]).map(res => res[pilier]||0).sum()
    result[pilier]=total
  })
  return result
}

const computeAvailableGoldSoftSkills =  async (userId, params, data) => {
  return SoftSkill.find()
}

const computeAvailableSilverSoftSkills =  async (userId, params, data) => {
 return await SoftSkill.find({_id: {$nin: data.gold_soft_skills}})
}

const computeAvailableBronzeSoftSkills =  async (userId, params, data) => {
  return await SoftSkill.find({_id: {$nin: [...data.gold_soft_skills, ...data.silver_soft_skills]}})
}

const mapMedals = owner => {
  let medals={}
  if(owner.gold_soft_skills) {
    owner.gold_soft_skills.forEach(softSkill => medals[softSkill.value]=SS_MEDALS_GOLD)
  }
  if(owner.silver_soft_skills)  {
    owner.silver_soft_skills.forEach(softSkill => medals[softSkill.value]=SS_MEDALS_SILVER)
  }
  if(owner.bronze_soft_skills)  {
    owner.bronze_soft_skills.forEach(softSkill => medals[softSkill.value]=SS_MEDALS_BRONZE)
  }
  return medals
}

function computePilar(owner, pilar) {
  const medals = mapMedals(owner)
  const pilars = computePilars(medals)
  const max_value = lodash(pilars).values().max()
  // Convert to percent value
  const value = pilars[pilar] / max_value
  return value
}

module.exports={
  computeAvailableGoldSoftSkills, computeAvailableSilverSoftSkills, computeAvailableBronzeSoftSkills,
  MATRIX, computePilars, computeGold, computeBronze, computeSilver, computeEmpty, computeActivated,
  computePilar,
}