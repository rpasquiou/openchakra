const mongoose = require('mongoose')
const moment = require('moment')
const { MONGOOSE_OPTIONS } = require('../../server/utils/database')
const Announce = require('../../server/models/Announce')
const Job = require('../../server/models/Job')

describe('Search', () => {
  beforeAll(async() => {
    const DBNAME=`test${moment().unix()}`
    await mongoose.connect(`mongodb://localhost/${DBNAME}`, MONGOOSE_OPTIONS)
    const job = await Job.create({ name: 'Developer', job_file: new mongoose.Types.ObjectId() })
    const announce = await Announce.create({
      user: new mongoose.Types.ObjectId(),
      job: job._id,
      title: 'Looking for Dev'
    })
  })
})