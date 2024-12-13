const mongoose = require('mongoose')
const {MONGOOSE_OPTIONS, loadFromDb} = require('../../server/utils/database')
const { getDatabaseUri } = require('../../config/config')
require('../../server/plugins/aftral-lms/functions')
const User=require('../../server/models/User')


jest.setTimeout(2*60*1000)

describe('Test performances', () => {

  beforeAll(async() => {
    await mongoose.connect(getDatabaseUri(), MONGOOSE_OPTIONS)
  })

  afterAll(async() => {
    await mongoose.connection.close()
  })

//
  it.only('must load report quickly', async() => {
    const model='statistics'
    const id='675b17d86335ae749a777fb7'
    const fields='sessions.name,sessions,sessions.trainees.statistics.spent_time_str,sessions.trainees.email,sessions.trainees.statistics.resources_progress,sessions.trainees.plain_password,sessions.trainees,sessions.trainees.firstname,sessions.trainees.lastname,sessions.trainees.creation_date,sessions.proof,sessions.certificate,sessions.achievement_status,sessions.code'.split(',')
    const params='limit=30&limit.sessions=30&limit.sessions.trainees=30&limit=30&limit.sessions=30&limit=30&limit.sessions=30&limit.sessions=30&limit=30&limit=30&limit.sessions=30&limit.sessions=30&limit=30&sort.sessions.trainees.lastname=asc'
    const user=await User.findOne({email: 'hello+formateur@wappizy.com'})
    console.time('Loading stats')
    await loadFromDb({model, id, user, fields, params})    
    console.timeEnd('Loading stats')
  })

})
