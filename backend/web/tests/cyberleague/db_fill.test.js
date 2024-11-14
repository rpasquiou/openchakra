const mongoose = require('mongoose')
require('lodash.combinations')
const lodash = require('lodash')
const moment = require('moment')
const User = require('../../server/models/User')
const { ROLE_MEMBER, ANSWER_YES, ANSWER_NO, SCORE_LEVEL_1, SECTOR, COMPANY_SIZE, SECTOR_SPORT, COMPANY_SIZE_1001_PLUS, COMPLETED_YES, SECTOR_AERONAUTICS} = require('../../server/plugins/cyberleague/consts')
const Score = require('../../server/models/Score')
require('../../server/models/QuestionCategory')
require('../../server/models/School')
require('../../server/models/ExpertiseSet')
require('../../server/models/Gift')
require('../../server/models/Event')
require('../../server/models/Certification')
require('../../server/models/CustomerSuccess')
require('../../server/models/ExpertiseCategory')
require('../../server/models/Answer')
const Question = require('../../server/models/Question')
const { loadFromDb, MONGOOSE_OPTIONS} = require('../../server/utils/database')
const { ensureQuestionCategories} = require('../../server/plugins/cyberleague/functions')
const { createScore } = require('../../server/plugins/cyberleague/score')
const Answer = require('../../server/models/Answer')
const { REGIONS } = require('../../utils/consts')
const Company = require('../../server/models/Company')
const { getMicroTime } = require('../../utils/dateutils')
const { computeBellwetherStatistics } = require('../../server/plugins/cyberleague/statistic')
require('../../server/plugins/cyberleague/functions')

let categories,dataQ1, dataQ2, dataQ3
beforeAll(async () => {
  await mongoose.connect(`mongodb://localhost/test${moment().unix()}`, MONGOOSE_OPTIONS)
  await ensureQuestionCategories()

  //questions build
  categories = await loadFromDb({model: 'questionCategory', fields: ['name']})
  dataQ1 = await Question.create({text: 'WAF', weight: '1', question_category: categories[0]._id, is_bellwether: true, min_level: SCORE_LEVEL_1})
  dataQ2 = await Question.create({text: 'MFA', weight: '2', question_category: categories[1]._id, is_bellwether: true, min_level: SCORE_LEVEL_1})
  dataQ3 = await Question.create({text: 'admin', weight: '3', question_category: categories[2]._id, is_bellwether: true, min_level: SCORE_LEVEL_1})


  //company build, need one for each {sector, région, size} except {sport guadeloupe, 1001+}
  let companies = []

  Object.keys(SECTOR).map((sector) => {
    lodash.forEach(REGIONS, async (region) => {
      lodash.forEach(COMPANY_SIZE, async (_,size) => {
        if (sector != SECTOR_SPORT || region != 'Guadeloupe' || size != COMPANY_SIZE_1001_PLUS) {
          const newCompany = Company.create({
            name: `fill_${sector}_${region}_${size}`,
            size: size,
            city: {region: region, city: `filler city`, latitude: 0, longitude: 0},
            sector: sector
          })

          companies.push(newCompany)
        }
      })
    })
  })

  companies = await Promise.all(companies)
console.log('companies',companies.length);


  //user build, one for each company
  const users = await Promise.all(companies.map(comp => {
    return User.create({firstname: 'phil', lastname: comp.name, email: 'email@test.com', role: ROLE_MEMBER, password: 'test',company: comp._id})
  }))

console.log('users',users.length);


  //score build
  let scores = []
  const startMoment = moment()
  users.forEach(async (user) => {
    //build 10 lvl 1 scores for each user
    lodash.range(10).forEach(async () => {
      const score = createScore(user._id, SCORE_LEVEL_1)
      scores.push(score)
    })
  })

  scores = await Promise.all(scores)

  //Complete scores created after startMoment
  const answers = await Answer.find({creation_date: {$gte: startMoment}}, ['_id'])
  answers.map(async (a) => {
    return await Answer.findByIdAndUpdate(a._id, {answer: Math.random() < 0.5 ? ANSWER_NO : ANSWER_YES})
  })

  //Make scores completed
  console.log('scores', scores.length);
  
  scores.forEach(async (score) => {
    return await computeScoresIfRequired(score._id)
  })
})

afterAll(async () => {
  await mongoose.connection.dropDatabase()
  await mongoose.connection.close()
})

describe(`score tests`, () => {
  it.only(`must have 10 completed scores for each {sector, size,region} except {sport guadeloupe, 1001+}`, async () => {

    lodash.forEach(SECTOR, (_, sector) => {
      lodash.forEach(REGIONS, (region) => {
        lodash.forEach(COMPANY_SIZE, async (_,size) => {
          const user = await User.find({lastname: `fill_${sector}_${region}_${size}`},[`_id`])
          const scores = await Score.find({creator: user._id, completed: COMPLETED_YES}, ['_id'])
          if (sector != SECTOR_SPORT || region != 'Guadeloupe' || size != COMPANY_SIZE_1001_PLUS) {
            expect(scores.length).toEqual(10)
          } else {
            expect(scores.length).toEqual(0)
          }
        })
      })
    })

  })

  // it.skip(`must have acceptable perfs`, async () => {
  //   //all 3 criterias
  //   const filterAll = {[`filter.sector`]: SECTOR_AERONAUTICS, [`filter.size`]: COMPANY_SIZE_1001_PLUS, [`filter.region`]: `Corse`}

  //   //3 ways of having 2 criterias
  //   const filters2 = lodash.combinations(lodash.toPairs(filterAll), 2).map((elem) => {lodash.fromPairs(elem)})

  //   //3 ways of having 1 criteria
  //   const filters1 = lodash.toPairs(filterAll).map((elem) => {lodash.fromPairs([elem])})

  //   //0 criteria
  //   const filterNone = {}

  //   ([filterAll, filterNone, ...filters2, ...filters1]).forEach(async (filter) => {
  //     const startTime = getMicroTime()
  //     computeBellwetherStatistics(filter)
  //     const endTime = getMicroTime()

  //     //less then 2sec
  //     expect(endTime-startTime < 2000000)
  //   })
  // })
})