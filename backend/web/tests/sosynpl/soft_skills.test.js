const lodash=require('lodash')
const {SOFT_SKILL_COMM, SS_MEDALS_GOLD, SS_MEDALS_BRONZE, SOFT_SKILL_FEDERATE, SOFT_SKILL_CREATIVE, SS_MEDALS_SILVER, SOFT_SKILL_ORGANIZATION, SOFT_SKILL_MANAGE, SOFT_SKILL_TEAMWORK, SS_PILAR, SOFT_SKILLS, SS_MEDALS, SOFT_SKILL_CONFLICT, SOFT_SKILL_CHANGE, SOFT_SKILL_ADAPTATION, SOFT_SKILL_ANALYSIS, SS_PILAR_COORDINATOR, SS_PILAR_CREATOR, SS_PILAR_DIRECTOR, SS_PILAR_IMPLEMENTOR, SS_PILAR_NETWORKER, SS_PILAR_OPTIMIZER}=require('../../server/plugins/sosynpl/consts')
const { computePilier, computePiliers, MATRIX, computeGold, computeSilver, computeBronze, computeEmpty, computeActivated } = require('../../server/plugins/sosynpl/soft_skills')
jest.setTimeout(60000)

describe('Test imports', () => {

  beforeAll(async () => {
  })
  
  afterAll(async () => {
  })

  const keyFromValue = (enumData, value) => {
    return Object.entries(enumData).find(([k, val])=> val==value)?.[0]
  }

  const CHARLOTTE_MEDALS={ 
    [SOFT_SKILL_COMM]: SS_MEDALS_BRONZE,
    [SOFT_SKILL_TEAMWORK]: SS_MEDALS_BRONZE,
    [SOFT_SKILL_FEDERATE]: SS_MEDALS_BRONZE,
    [SOFT_SKILL_CREATIVE]: SS_MEDALS_SILVER,
    [SOFT_SKILL_ORGANIZATION]: SS_MEDALS_GOLD,
    [SOFT_SKILL_MANAGE]: SS_MEDALS_SILVER,
  }

  const MEDALS_VALUES={
    [SS_MEDALS_GOLD]:3,
    [SS_MEDALS_SILVER]:2,
    [SS_MEDALS_BRONZE]:1,
  }

  const VALUES_MEDALS={
    1: SS_MEDALS_BRONZE,
    2: SS_MEDALS_SILVER,
    3: SS_MEDALS_GOLD,
  }

  it.skip('Must create matrix', () => {
    const data=` Créateur	Implémenteur	Optimisateur	Réseauteur	Coordinateur	Directeur
    Communication	1	1	0	2	1	0
    Travail en équipe	1	2	0	2	2	1
    Gestion des conflits	0	0	1	1	1	1
    Promoteur du changement	2	1	0	0	1	2
    Capacité à fédérer	1	0	1	3	0	2
    Créativité, curiosité	3	0	2	1	0	0
    Adaptabilité	0	3	2	1	0	0
    Analyse, prise de recul	2	1	3	0	0	0
    Organisation	0	2	1	0	3	1
    Diriger, manager	0	0	0	0	2	3`.split('\n').map(l => l.split('\t').map(str => str.trim()))
    const piliers=data[0].map(v => keyFromValue(SS_PILAR, v))
    const themes=data.slice(1)
    const res=[]
    themes.forEach(theme => {
      const themeName=theme[0]
      const medals=theme.slice(1)
      const themeKey = keyFromValue(SOFT_SKILLS, theme[0])
      return medals.forEach((medalNo, idx) => {
        const pilier=piliers[idx]
        const medal=VALUES_MEDALS[+medalNo]
        if (medal) {
          const cmd=`setMatrixMedal(${themeKey}, ${pilier}, ${medal})`
          res.push(cmd)
        }
      })
    })
    console.log(res.join('\n'))
  })

  it('Matrix themes must be consistent', () => {
    const countForTheme = theme => lodash(MATRIX[theme]).values().map(v => MEDALS_VALUES[v]).sum()
    const THEMES_EXPECTED={
      [SOFT_SKILL_COMM]: 5,
      [SOFT_SKILL_TEAMWORK]: 8,
      [SOFT_SKILL_CONFLICT]: 4,
      [SOFT_SKILL_CHANGE]: 6,
      [SOFT_SKILL_FEDERATE]: 7,
      [SOFT_SKILL_CREATIVE]: 6,
      [SOFT_SKILL_ADAPTATION]: 6,
      [SOFT_SKILL_ANALYSIS]: 6,
      [SOFT_SKILL_ORGANIZATION]: 7,
      [SOFT_SKILL_MANAGE]: 5,
    }
    Object.entries(THEMES_EXPECTED)
      .forEach(([theme, expected]) => expect(countForTheme(theme)).toBe(expected))
  })
  
  it('Matrix piliers must be consistent', () => {
    const countForPilier = pilier => {
      return lodash(MATRIX).values().map(v => MEDALS_VALUES[v[pilier]]||0).sum()
    }
    const PILIERS_EXPECTED={
      [SS_PILAR_COORDINATOR]: 10,
      [SS_PILAR_CREATOR]: 10,
      [SS_PILAR_DIRECTOR]: 10,
      [SS_PILAR_IMPLEMENTOR]: 10,
      [SS_PILAR_NETWORKER]: 10,
      [SS_PILAR_OPTIMIZER]: 10,
    }
    Object.entries(PILIERS_EXPECTED)
      .forEach(([pilier, expected]) => expect(countForPilier(pilier)).toBe(expected))
    
  })
  
  it('must compute gold medals for Charlotte', async () => {
    const result=await computeGold(CHARLOTTE_MEDALS)
    expect(result).toEqual({[SS_PILAR_COORDINATOR]: 10})
  })

  it('must compute silver medals for Charlotte', async () => {
    const result=await computeSilver(CHARLOTTE_MEDALS)
    expect(result).toEqual({[SS_PILAR_COORDINATOR]: 5, [SS_PILAR_OPTIMIZER]: 5})
  })

  it('must compute bronze medals for Charlotte', async () => {
    const result=await computeBronze(CHARLOTTE_MEDALS)
    expect(result).toEqual({
      [SS_PILAR_CREATOR]: 9, 
      [SS_PILAR_IMPLEMENTOR]: 3,
      [SS_PILAR_OPTIMIZER]: 3,
      [SS_PILAR_COORDINATOR]: 3,
      [SS_PILAR_DIRECTOR]: 3,
    })
  })

  it('must compute empty medals for Charlotte', async () => {
    const result=await computeEmpty(CHARLOTTE_MEDALS)
    expect(result).toEqual({
      [SS_PILAR_CREATOR]: 2, 
      [SS_PILAR_IMPLEMENTOR]: 1,
      [SS_PILAR_OPTIMIZER]: 1,
      [SS_PILAR_NETWORKER]: 2,
      [SS_PILAR_COORDINATOR]: 2,
      [SS_PILAR_DIRECTOR]: 2,
    })
  })

  it('must compute activated skills for Charlotte', async () => {
    const result=await computeActivated(CHARLOTTE_MEDALS)
    expect(result).toEqual({
      [SS_PILAR_CREATOR]: 10, 
      [SS_PILAR_COORDINATOR]: 5,
    })
  })

  it('must compute piliers for Charlotte', async () => {
    const result=await computePiliers(CHARLOTTE_MEDALS)

    const EXPECTED={
      SS_PILAR_CREATOR: 21,
      SS_PILAR_IMPLEMENTOR: 4,
      SS_PILAR_OPTIMIZER: 9,
      SS_PILAR_NETWORKER: 2,
      SS_PILAR_COORDINATOR: 25,
      SS_PILAR_DIRECTOR: 5,
    }

    Object.entries(EXPECTED).forEach(([pilier, points]) => {
      const msg=`Pilier ${pilier} must have ${points} points`
      expect(result[pilier], msg).toEqual(points)
    })
  })

})

