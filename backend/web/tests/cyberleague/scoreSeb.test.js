const mongoose = require('mongoose')
const moment = require('moment')
const User = require('../../server/models/User')
const { ROLE_MEMBER, ANSWER_YES, ANSWER_NO, ANSWER_NOT_APPLICABLE, SCORE_LEVEL_1 } = require('../../server/plugins/cyberleague/consts')
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
const { loadFromDb, MONGOOSE_OPTIONS, idEqual } = require('../../server/utils/database')
const { ensureQuestionCategories, testOnlyPostCreate } = require('../../server/plugins/cyberleague/functions')
const { computeScores } = require('../../server/plugins/cyberleague/score')
require('../../server/plugins/cyberleague/functions')

let categories, user, dataScore
beforeAll(async () => {
  await mongoose.connect(`mongodb://localhost/test${moment().unix()}`, MONGOOSE_OPTIONS)
  await ensureQuestionCategories()
  //data build
  categories = await loadFromDb({model: 'questionCategory', fields: ['name']})
  const dataQ1 = await Question.create({text: 'q1', weight: '1', question_category: categories[0]._id, is_bellwether: false, is_level_1: true})
  const dataQ2 = await Question.create({text: 'q2', weight: '2', question_category: categories[1]._id, is_bellwether: true, is_level_1: true})
  const dataQ3 = await Question.create({text: 'q3', weight: '3', question_category: categories[2]._id, is_bellwether: false, is_level_1: true})
  user=await User.create({firstname: 'user', lastname: 'test', email: 'email@test.com', role: ROLE_MEMBER, password: 'test'})
})

afterAll(async () => {
  await mongoose.connection.dropDatabase()
  await mongoose.connection.close()
})

describe(`score tests`, () => {
  it(`must be initialized correctly`, async () => {
    const dataScore=await Score.create({creator: user._id, level: SCORE_LEVEL_1})
    await testOnlyPostCreate({model: `score`, data: dataScore})
    const loaded=await loadFromDb({model: 'score', fields:['answers']})
    console.log(loaded)
  })
})