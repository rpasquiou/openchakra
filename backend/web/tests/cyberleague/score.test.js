const mongoose = require('mongoose')
const moment = require('moment')
const User = require('../../server/models/User')
const { ROLE_MEMBER, ANSWER_YES, ANSWER_NO, ANSWER_NOT_APPLICABLE } = require('../../server/plugins/cyberleague/consts')
const Score = require('../../server/models/Score')
require('../../server/models/QuestionCategory')
require('../../server/models/School')
require('../../server/models/ExpertiseSet')
require('../../server/models/Gift')
require('../../server/models/Event')
require('../../server/models/Certification')
require('../../server/models/CustomerSuccess')
require('../../server/models/ExpertiseCategory')
const Question = require('../../server/models/Question')
const { loadFromDb, MONGOOSE_OPTIONS } = require('../../server/utils/database')
const { ensureQuestionCategories } = require('../../server/plugins/cyberleague/functions')
const { computeScores } = require('../../server/plugins/cyberleague/score')
require('../../server/plugins/cyberleague/functions')


beforeAll(async () => {
  await mongoose.connect(`mongodb://localhost/test${moment().unix()}`, MONGOOSE_OPTIONS)
  await ensureQuestionCategories()
})

afterAll(async () => {
  await mongoose.connection.dropDatabase()
  await mongoose.connection.close()
})

describe(`score computing test`, () => {
  it(`must have correct rates`, async () => {
    //data build
    const categories = await loadFromDb({model: 'questionCategory', fields: ['name']})
    const dataQ1 = await Question.create({text: 'q1', weight: '1', question_category: categories[0]._id, is_bellwether: false})
    const dataQ2 = await Question.create({text: 'q2', weight: '2', question_category: categories[1]._id, is_bellwether: true})
    const dataQ3 = await Question.create({text: 'q3', weight: '3', question_category: categories[2]._id, is_bellwether: false})
    const questions = [ {question: dataQ1, answer: ANSWER_NOT_APPLICABLE} , {question: dataQ2, answer: ANSWER_NO} , {question: dataQ3, answer: ANSWER_YES} ]
    const dataUser=await User.create({firstname: 'user', lastname: 'test', email: 'email@test.com', role: ROLE_MEMBER, password: 'test'})
    const dataScore=await Score.create({creator: dataUser._id, questions: questions})


    const loadedQ = await loadFromDb({model: 'question', fields:['text','weight','question_category','is_bellwether']})
    const loadedS = await loadFromDb({model: 'score', fields: ['creator','questions','deviation']})
    const loadedU = await loadFromDb({model: 'user', fields: ['firstname']})

    //data length verification
    expect(loadedQ.length).toEqual(3)
    expect(loadedS.length).toEqual(1)
    expect(loadedU.length).toEqual(1)

    const score = loadedS[0]

    expect(score.questions.length).toEqual(3)

    const user = loadedU[0]
    const q1 = loadedQ[0]
    const q2 = loadedQ[1]
    const q3 = loadedQ[2]
    const scoreQ1 = score.questions[0]
    const scoreQ2 = score.questions[1]
    const scoreQ3 = score.questions[2]

    //Id verif
    expect(user._id).toEqual(dataUser._id)
    expect(score._id).toEqual(dataScore._id)

    expect(q1._id).toEqual(dataQ1._id)
    expect(q2._id).toEqual(dataQ2._id)
    expect(q3._id).toEqual(dataQ3._id)

    expect(score.creator._id).toEqual(dataUser._id)

    expect(scoreQ1.question).toEqual(dataQ1._id)
    expect(scoreQ2.question).toEqual(dataQ2._id)
    expect(scoreQ3.question).toEqual(dataQ3._id)

    //virtual verif
    expect(score.deviation).toEqual(1)

    //computedScores verif    
    const computedScores = await computeScores(questions)

    expect(computedScores.category_rates.length).toEqual(2)
    expect(computedScores.bellwether_rates.length).toEqual(1)

    expect(computedScores.global_rate).toEqual(0.60)

    if (computedScores.category_rates[0].question_category == categories[1]._id) {
      expect(computedScores.category_rates[1].question_category.toString()).toEqual(categories[2]._id.toString())
      
      expect(computedScores.category_rates[0].category_rate).toEqual(0)
      expect(computedScores.category_rates[1].category_rate).toEqual(1)
    } else {
      expect(computedScores.category_rates[0].question_category.toString()).toEqual(categories[2]._id.toString())
      expect(computedScores.category_rates[1].question_category.toString()).toEqual(categories[1]._id.toString())

      expect(computedScores.category_rates[0].category_rate).toEqual(1)
      expect(computedScores.category_rates[1].category_rate).toEqual(0)
    }

    expect(computedScores.bellwether_rates[0].question_category.toString()).toEqual(categories[1]._id.toString())
    expect(computedScores.bellwether_rates[0].category_rate).toEqual(0)
  })
})