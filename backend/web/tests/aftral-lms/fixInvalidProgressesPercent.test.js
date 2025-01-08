const mongoose = require('mongoose')
const path = require('path')
const { MONGOOSE_OPTIONS } = require('../../server/utils/database')
// require('../../server/plugins/aftral-lms/functions')
const Block = require('../../server/models/Block')
const Progress = require('../../server/models/Progress')
const User = require('../../server/models/User')
const { ROLE_APPRENANT } = require('../../server/plugins/aftral-lms/consts')

jest.setTimeout(600000)

const ROOT = path.join(__dirname, './data')

describe('Test session/trainees polling', () => {

  beforeAll(async() => {
    await mongoose.connect(`mongodb://localhost/aftral-lms`, MONGOOSE_OPTIONS)
  })

  afterAll(async() => {
    await mongoose.connection.close()
  })

  it('misc', async() => {
    const progresses=await Progress.find({finished_resources_count: {$gt: 0}}).populate({path: 'block'}).populate('user')
    const invalidProgresses=progresses.filter(p => p.finished_resources_count>p.block?.mandatory_resources_count)
    console.log(invalidProgresses.map(invalidProgress => [invalidProgress._id, invalidProgress.block.name, invalidProgress.user.fullname, invalidProgress.finished_resources_count, invalidProgress.block.mandatory_resources_count]))
    await Promise.all(invalidProgresses.map(async invalid => {
      await Progress.findByIdAndUpdate(invalid._id, {finished_resources_count: invalid.block.mandatory_resources_count})
    }))
  })
})
