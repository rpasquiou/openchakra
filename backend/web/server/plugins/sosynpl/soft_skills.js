import { SS_MEDALS_BRONZE, SS_MEDALS_GOLD, SS_MEDALS_SILVER, SS_PILIER, SS_PILIER_COORDINATOR, SS_PILIER_CREATOR, 
  SS_PILIER_DIRECTOR, SS_PILIER_IMPLEMENTOR, SS_PILIER_NETWORKER, SS_PILIER_OPTIMIZER, SS_THEMES, SS_THEMES_ADAPTATION, 
  SS_THEMES_ANALYSIS, SS_THEMES_CHANGE, SS_THEMES_COMM, SS_THEMES_CONFLICT, SS_THEMES_CREATIVE, SS_THEMES_FEDERATE, 
  SS_THEMES_MANAGE, SS_THEMES_ORGANIZATION, SS_THEMES_TEAMWORK } from './consts'

const lodash=require('lodash')

// Matrix mapping (theme, medal) to a pilier
export const MATRIX={}

const setMatrixMedal = (theme, pilier, medal) => {
  lodash.set(MATRIX, `${theme}.${pilier}`, medal)
}

function getMedalAt(theme, pilier) {
  return lodash.get(MATRIX, `${theme}.${pilier}`)
}

const isMedalAt = (theme, pilier, medal) => {
  return getMedalAt(theme, pilier)==medal
}

setMatrixMedal(SS_THEMES_COMM, SS_PILIER_CREATOR, SS_MEDALS_BRONZE)
setMatrixMedal(SS_THEMES_COMM, SS_PILIER_IMPLEMENTOR, SS_MEDALS_BRONZE)
setMatrixMedal(SS_THEMES_COMM, SS_PILIER_NETWORKER, SS_MEDALS_SILVER)
setMatrixMedal(SS_THEMES_COMM, SS_PILIER_COORDINATOR, SS_MEDALS_BRONZE)
setMatrixMedal(SS_THEMES_TEAMWORK, SS_PILIER_CREATOR, SS_MEDALS_BRONZE)
setMatrixMedal(SS_THEMES_TEAMWORK, SS_PILIER_IMPLEMENTOR, SS_MEDALS_SILVER)
setMatrixMedal(SS_THEMES_TEAMWORK, SS_PILIER_NETWORKER, SS_MEDALS_SILVER)
setMatrixMedal(SS_THEMES_TEAMWORK, SS_PILIER_COORDINATOR, SS_MEDALS_SILVER)
setMatrixMedal(SS_THEMES_TEAMWORK, SS_PILIER_DIRECTOR, SS_MEDALS_BRONZE)
setMatrixMedal(SS_THEMES_CONFLICT, SS_PILIER_OPTIMIZER, SS_MEDALS_BRONZE)
setMatrixMedal(SS_THEMES_CONFLICT, SS_PILIER_NETWORKER, SS_MEDALS_BRONZE)
setMatrixMedal(SS_THEMES_CONFLICT, SS_PILIER_COORDINATOR, SS_MEDALS_BRONZE)
setMatrixMedal(SS_THEMES_CONFLICT, SS_PILIER_DIRECTOR, SS_MEDALS_BRONZE)
setMatrixMedal(SS_THEMES_CHANGE, SS_PILIER_CREATOR, SS_MEDALS_SILVER)
setMatrixMedal(SS_THEMES_CHANGE, SS_PILIER_IMPLEMENTOR, SS_MEDALS_BRONZE)
setMatrixMedal(SS_THEMES_CHANGE, SS_PILIER_COORDINATOR, SS_MEDALS_BRONZE)
setMatrixMedal(SS_THEMES_CHANGE, SS_PILIER_DIRECTOR, SS_MEDALS_SILVER)
setMatrixMedal(SS_THEMES_FEDERATE, SS_PILIER_CREATOR, SS_MEDALS_BRONZE)
setMatrixMedal(SS_THEMES_FEDERATE, SS_PILIER_OPTIMIZER, SS_MEDALS_BRONZE)
setMatrixMedal(SS_THEMES_FEDERATE, SS_PILIER_NETWORKER, SS_MEDALS_GOLD)
setMatrixMedal(SS_THEMES_FEDERATE, SS_PILIER_DIRECTOR, SS_MEDALS_SILVER)
setMatrixMedal(SS_THEMES_CREATIVE, SS_PILIER_CREATOR, SS_MEDALS_GOLD)
setMatrixMedal(SS_THEMES_CREATIVE, SS_PILIER_OPTIMIZER, SS_MEDALS_SILVER)
setMatrixMedal(SS_THEMES_CREATIVE, SS_PILIER_NETWORKER, SS_MEDALS_BRONZE)
setMatrixMedal(SS_THEMES_ADAPTATION, SS_PILIER_IMPLEMENTOR, SS_MEDALS_GOLD)
setMatrixMedal(SS_THEMES_ADAPTATION, SS_PILIER_OPTIMIZER, SS_MEDALS_SILVER)
setMatrixMedal(SS_THEMES_ADAPTATION, SS_PILIER_NETWORKER, SS_MEDALS_BRONZE)
setMatrixMedal(SS_THEMES_ANALYSIS, SS_PILIER_CREATOR, SS_MEDALS_SILVER)
setMatrixMedal(SS_THEMES_ANALYSIS, SS_PILIER_IMPLEMENTOR, SS_MEDALS_BRONZE)
setMatrixMedal(SS_THEMES_ANALYSIS, SS_PILIER_OPTIMIZER, SS_MEDALS_GOLD)
setMatrixMedal(SS_THEMES_ORGANIZATION, SS_PILIER_IMPLEMENTOR, SS_MEDALS_SILVER)
setMatrixMedal(SS_THEMES_ORGANIZATION, SS_PILIER_OPTIMIZER, SS_MEDALS_BRONZE)
setMatrixMedal(SS_THEMES_ORGANIZATION, SS_PILIER_COORDINATOR, SS_MEDALS_GOLD)
setMatrixMedal(SS_THEMES_ORGANIZATION, SS_PILIER_DIRECTOR, SS_MEDALS_BRONZE)
setMatrixMedal(SS_THEMES_MANAGE, SS_PILIER_COORDINATOR, SS_MEDALS_SILVER)
setMatrixMedal(SS_THEMES_MANAGE, SS_PILIER_DIRECTOR, SS_MEDALS_GOLD)

export const computeGold = (medals) => {
  const gold=lodash(medals).pickBy((v, k) => v==SS_MEDALS_GOLD).value()
  const themes=Object.keys(gold)
  let result={}
  themes.forEach(theme => {
    Object.keys(SS_PILIER).forEach(pilier => {
      if (isMedalAt(theme, pilier, SS_MEDALS_GOLD)) {
        result[pilier]=(result[pilier]||0)+10
      }
    })
  })
  return result
}

export const computeSilver = (medals) => {
  const silver=lodash(medals).pickBy((v, k) => v==SS_MEDALS_SILVER).value()
  const themes=Object.keys(silver)
  let result={}
  themes.forEach(theme => {
    Object.keys(SS_PILIER).forEach(pilier => {
      if (isMedalAt(theme, pilier, SS_MEDALS_SILVER)) {
        result[pilier]=(result[pilier]||0)+5
      }
    })
  })
  return result
}

export const computeBronze = (medals) => {
  const bronze=lodash(medals).pickBy((v, k) => v==SS_MEDALS_BRONZE).value()
  const themes=Object.keys(bronze)
  let result={}
  themes.forEach(theme => {
    Object.keys(SS_PILIER).forEach(pilier => {
      if (isMedalAt(theme, pilier, SS_MEDALS_BRONZE)) {
        result[pilier]=(result[pilier]||0)+3
      }
    })
  })
  return result
}

// Add 1 point for each pilier where both theme and customer themes are ampty
export const computeEmpty = (medals) => {
  const emptyThemes=lodash.difference(Object.keys(SS_THEMES), Object.keys(medals))
  let result={}
  Object.keys(SS_PILIER).forEach(pilier => {
    emptyThemes.forEach(theme => {
      if (!getMedalAt(theme, pilier)) {
        result[pilier]=(result[pilier]||0)+1
      }
    })
  })
  return result
}

export const computeActivated = medals => {
  // 5 points on each pilier who have the same medals
  let result={}
  Object.keys(SS_PILIER).forEach(pilier => {
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
  Object.keys(SS_PILIER).forEach(pilier => {
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

export const computePiliers = medals =>  {
  let result=Object.fromEntries(Object.keys(SS_PILIER).map(k => [k, 0]))
  const gold=computeGold(medals)
  const silver=computeSilver(medals)
  const bronze=computeBronze(medals)
  const empty=computeEmpty(medals)
  const activated=computeActivated(medals)
  Object.keys(SS_PILIER).forEach(pilier => {
    const total=lodash([gold, silver, bronze, empty, activated]).map(res => res[pilier]||0).sum()
    result[pilier]=total
  })
  return result
}

