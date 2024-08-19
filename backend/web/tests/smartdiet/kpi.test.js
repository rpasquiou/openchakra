const mongoose = require('mongoose')
const Company = require('../../server/models/Company')
const { MONGOOSE_OPTIONS } = require('../../server/utils/database')
const { coachings_started, coachings_finished, coachings_dropped, coachings_stopped, coachings_ongoing } = require('../../server/plugins/smartdiet/kpi')
const { ExistingObjectReplicationStatus } = require('@aws-sdk/client-s3')

require('../../server/plugins/smartdiet/functions')
describe('KPI Test', () => {

  beforeAll(async () => {
    await mongoose.connect(`mongodb://localhost/smartdiet`, MONGOOSE_OPTIONS)
  })

  afterAll(async () => {
    await mongoose.connection.close()
  })

  it('must count started coachings', async() => {
    const start='2020-01-01'
    const end='2020-12-31'
    const company=await Company.findOne({name: /routier/i})
    const started_coachings=await coachings_started({company: company._id, start_date: start, end_date: end})
    const finished=await coachings_finished({company: company._id, start_date: start, end_date: end})
    const dropped=await coachings_dropped({company: company._id, start_date: start, end_date: end})
    const stopped=await coachings_stopped({company: company._id, start_date: start, end_date: end})
    const current=await coachings_ongoing({company: company._id, start_date: start, end_date: end})
    console.log('started', started_coachings, 'finished', finished, 'dropped', dropped, 'stopped', stopped, 'current', current)
    return expect(finished+dropped+stopped+current).toEqual(started_coachings)
  })

})
