const mongoose = require('mongoose')
const moment = require('moment')
const User = require('../../server/models/User')
const { ROLE_MEMBER, ANSWER_YES, ANSWER_NO, ANSWER_NOT_APPLICABLE, SCORE_LEVEL_1, SCORE_LEVEL_2, SCORE_LEVEL_3 } = require('../../server/plugins/cyberleague/consts')
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
const { ensureQuestionCategories} = require('../../server/plugins/cyberleague/functions')
const { computeScoresIfRequired, createScore } = require('../../server/plugins/cyberleague/score')
const Answer = require('../../server/models/Answer')
require('../../server/plugins/cyberleague/functions')

let categories,dataQ1, dataQ2, dataQ3, dataUser, dataScore
beforeAll(async () => {
  await mongoose.connect(`mongodb://localhost/test${moment().unix()}`, MONGOOSE_OPTIONS)
  await ensureQuestionCategories()
  //data build
  categories = await loadFromDb({model: 'questionCategory', fields: ['name']})
  dataQ1 = await Question.create({text: 'q1', weight: '1', question_category: categories[0]._id, is_bellwether: false, min_level: SCORE_LEVEL_1})
  dataQ2 = await Question.create({text: 'q2', weight: '2', question_category: categories[1]._id, is_bellwether: true, min_level: SCORE_LEVEL_1})
  dataQ3 = await Question.create({text: 'q3', weight: '3', question_category: categories[2]._id, is_bellwether: false, min_level: SCORE_LEVEL_1})
  dataUser = await User.create({firstname: 'user', lastname: 'test', email: 'email@test.com', role: ROLE_MEMBER, password: 'test'})
  dataScore = await createScore(dataUser._id, SCORE_LEVEL_1)
})

afterAll(async () => {
  await mongoose.connection.dropDatabase()
  await mongoose.connection.close()
})

describe(`score tests`, () => {
  it(`must be initialized correctly`, async () => {
    
    const loadedS = await loadFromDb({model: 'score', fields: ['creator','answers']})
    const loadedA = await loadFromDb({model: 'answer', fields:['question','answer']})
    const loadedU = await loadFromDb({model: 'user', fields: ['firstname']})

    //data length verif
    expect(loadedU.length).toEqual(1)
    expect(loadedA.length).toEqual(3)
    expect(loadedS.length).toEqual(1)

    const score = loadedS[0]
    const user = loadedU[0]
    
    expect(score.answers.length).toEqual(3)

    const scoreA1 = score.answers[0]
    const scoreA2 = score.answers[1]
    const scoreA3 = score.answers[2]
    const a1 = loadedA[0]
    const a2 = loadedA[1]
    const a3 = loadedA[2]

    //Id verif
    expect(user._id).toEqual(dataUser._id)
    expect(score._id).toEqual(dataScore._id)

    expect(score.creator._id).toEqual(dataUser._id)

    expect(scoreA1.question._id).toEqual(dataQ1._id)
    expect(scoreA2.question._id).toEqual(dataQ2._id)
    expect(scoreA3.question._id).toEqual(dataQ3._id)

    //answer.answer verif
    expect(!!a1.answer).toEqual(false)
    expect(!!a2.answer).toEqual(false)
    expect(!!a3.answer).toEqual(false)
  })

  it.only(`must compute correct rates`, async () => {
    
    //update answers
    await Answer.findOneAndUpdate(
      {question: dataQ1._id},
      {$set: {answer: ANSWER_NOT_APPLICABLE}}
    )
    await Answer.findOneAndUpdate(
      {question: dataQ2._id},
      {$set: {answer: ANSWER_NO}}
    )
    await Answer.findOneAndUpdate(
      {question: dataQ3._id},
      {$set: {answer: ANSWER_YES}}
    )

    const loadedS = await loadFromDb({model: 'score', fields: ['creator','answers','deviation']})
    let score = loadedS[0]

    expect(score.answers[0].answer).toEqual(ANSWER_NOT_APPLICABLE)
    expect(score.answers[1].answer).toEqual(ANSWER_NO)
    expect(score.answers[2].answer).toEqual(ANSWER_YES)
  
    //virtual verif
    expect(score.deviation).toEqual(1)

    //computedScores verif
    const requestedScore = await Score.findOne({answers: score.answers[0]._id})
    await computeScoresIfRequired(requestedScore._id)

    const loadedSAnswered = await loadFromDb({model: 'score', fields: ['category_rates','bellwether_rates','global_rate']})
    const scoreAnswered = loadedSAnswered[0]

    expect(scoreAnswered.category_rates.length).toEqual(2)
    expect(scoreAnswered.bellwether_rates.length).toEqual(1)

    expect(scoreAnswered.global_rate).toEqual(0.60)

    console.log(scoreAnswered.category_rates);
    
    expect(scoreAnswered.category_rates[1].name).toEqual(categories[2].name)
    
    expect(scoreAnswered.category_rates[0].value).toEqual(0)
    expect(scoreAnswered.category_rates[1].value).toEqual(1)

    expect(scoreAnswered.bellwether_rates[0].question_category.toString()).toEqual(categories[1].name.toString())
    expect(scoreAnswered.bellwether_rates[0].category_rate).toEqual(0)
  })

  it(`must have correct questions_by_category`, async () => {
    const loadedS = await loadFromDb({model: 'score', fields: ['questions_by_category']})

    const QbC = loadedS[0].questions_by_category

    expect(QbC.length).toEqual(3)

    expect(QbC[0].category).toEqual(dataQ1.question_category)
    expect(QbC[1].category).toEqual(dataQ2.question_category)
    expect(QbC[2].category).toEqual(dataQ3.question_category)

    expect(QbC[0].answers.length).toEqual(1)
    expect(QbC[1].answers.length).toEqual(1)
    expect(QbC[2].answers.length).toEqual(1)

    expect(QbC[0].answers[0].question._id).toEqual(dataQ1._id)
    expect(QbC[1].answers[0].question._id).toEqual(dataQ2._id)
    expect(QbC[2].answers[0].question._id).toEqual(dataQ3._id)
  })

  it(`must have questions according to level`, async () => {

    const dataQL2 = await Question.create({text: 'q4', weight: '3', question_category: categories[2]._id, is_bellwether: false, is_level_2: true})
    const dataQL3 = await Question.create({text: 'q5', weight: '3', question_category: categories[2]._id, is_bellwether: false, is_level_3: true})

    await createScore(dataUser._id, SCORE_LEVEL_2)
    await createScore(dataUser._id, SCORE_LEVEL_3)

    const loadedS = await loadFromDb({model: 'score', fields: ['answers.question','level','question_count']})

    expect(loadedS.length).toEqual(3)

    const score1 = loadedS[0]
    const score2 = loadedS[1]
    const score3 = loadedS[2]

    //level verif
    expect(score1.level).toEqual(SCORE_LEVEL_1)
    expect(score2.level).toEqual(SCORE_LEVEL_2)
    expect(score3.level).toEqual(SCORE_LEVEL_3)

    //answers length verif
    expect(score1.answers.length).toEqual(3)
    expect(score2.answers.length).toEqual(4)
    expect(score3.answers.length).toEqual(5)

    //answers id verif
    expect(score2.answers[3].question._id).toEqual(dataQL2._id)
    expect(score3.answers[4].question._id).toEqual(dataQL3._id)

    //question_count verif
    expect(score1.question_count).toEqual(3)
    expect(score2.question_count).toEqual(4)
    expect(score3.question_count).toEqual(5)
  })
})