const mongoose = require('mongoose')
const moment=require('moment');
const { MONGOOSE_OPTIONS, loadFromDb } = require('../../server/utils/database');
const { updateCoachingStatus } = require('../../server/plugins/smartdiet/coaching');
const Coaching = require('../../server/models/Coaching');
const { runPromisesWithDelay } = require('../../server/utils/concurrency');
require('../../server/plugins/smartdiet/functions')

require('../../server/plugins/smartdiet/functions')

jest.setTimeout(60*1000)

describe('Set ass quizz', () => {

  let user;

  beforeAll(async() => {
    await mongoose.connect(`mongodb://localhost/smartdiet`, MONGOOSE_OPTIONS)
  })

  afterAll(async() => {
    await mongoose.connection.close()
  })

  it('Must create ass quizz', async() => {
    const noAssCoachings=await Coaching.find({assessment_quizz: null})
    console.log(noAssCoachings.length)
    const res=await runPromisesWithDelay(noAssCoachings.map(c => () => {
      console.log(c._id)
      return updateCoachingStatus(c._id)
    }))
    console.log(res.filter(r => r.status=='rejected').map(r => r.reason))
  })

})
