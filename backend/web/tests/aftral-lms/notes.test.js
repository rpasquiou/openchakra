const mongoose = require('mongoose')
const { MONGOOSE_OPTIONS, loadFromDb } = require('../../server/utils/database')
require('../../server/plugins/aftral-lms/functions')
const User = require('../../server/models/User')

jest.setTimeout(60000)

describe('User', () => {
  beforeAll(async () => {
    await mongoose.connect(`mongodb://localhost/aftral-lms`, MONGOOSE_OPTIONS)
  })
  afterAll(async () => {
    await mongoose.connection.close()
  })

  it('must return resource max note', async () => {
    const trainer=await User.findOne({email: 'hello+formateur@wappizy.com'})
    expect(trainer).toBeTruthy()
    const fields=`sessions.trainees.statistics.children.children.children.success_note_max`.split(',')
    const [res]=await loadFromDb({model: 'statistics', id: '66d8afd04be164492f7b28a9-65bd6379b19ef201d3e91aaf', fields, user: trainer})
    const displayData = res.sessions[0].trainees[0].statistics.children[0].children[0].children[0]
    console.log(JSON.stringify(displayData, null,2))
  })

})