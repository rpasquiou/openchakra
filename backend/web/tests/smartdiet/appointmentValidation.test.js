const moment=require('moment')
const lodash=require('lodash')
const mongoose = require('mongoose')
const {MONGOOSE_OPTIONS, loadFromDb} = require('../../server/utils/database')
const Appointment = require('../../server/models/Appointment')
require('../../server/models/UserQuizz')
require('../../server/models/UserQuizzQuestion')
require('../../server/models/Item')
require('../../server/models/QuizzQuestion')


describe('Check appointments validations', () => {

  beforeAll(async() => {
    await mongoose.connect(`mongodb://localhost/smartdiet`, MONGOOSE_OPTIONS)
  })

  afterAll(async() => {
  })

  const checkAppts = async appts => {
    // Non abordé: Item [text: /non abord/i, quizzQuestion: id]
    for (const appt of appts) {
      console.log(appt)
      const answered=appt.progress.questions.some(q => !!q.single_enum_answer && !/non abord/i.test(q.single_enum_answer.text))
      console.log(appt.start_date,  'Answered:', !!answered)
    }
  }

  it('must check progress consistency', async() => {
    const start=moment().add(-1, 'month').startOf('month')
    const end=moment().add(-1, 'month').endOf('month')
    console.log(start)
    console.log(end)
    const appts=await Appointment.find({start_date: {$lte: end, $gte:start}, validated: {$ne :true}})
      .select({coaching:1, start_date:1, progress:1, validated:1, order:1})
      .sort({coaching:1, order:1})
      .populate({path: 'progress', populate: {path: 'questions', populate: ['quizz_question', 'single_enum_answer']}})
      .lean()
    const grouped=lodash(appts).groupBy(a => a.coaching._id.toString())
      .pickBy(appts => appts.length>1)
    await checkAppts(grouped.values().value()[5])
  })

})
