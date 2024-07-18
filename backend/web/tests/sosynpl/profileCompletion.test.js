const mongoose = require('mongoose')
const moment=require('moment')
const lodash = require('lodash')
const { MONGOOSE_OPTIONS, loadFromDb } = require('../../server/utils/database')
const JobFile = require('../../server/models/JobFile')
const Job = require('../../server/models/Job')
const Sector = require('../../server/models/Sector')
const { JOB_FILE_DATA, JOB_DATA, SECTOR_DATA, FREELANCE_DATA } = require('./data/base_data')
require('../../server/plugins/sosynpl/functions')
const CustomerFreelance = require('../../server/models/CustomerFreelance')
const { REQUIRED_ATTRIBUTES, MANDATORY_ATTRIBUTES, SOFT_SKILLS_ATTR } = require('../../server/plugins/sosynpl/freelance')
const { MOBILITY_CITY, WORK_MODE_REMOTE, COMPANY_SIZE_LESS_10 } = require('../../server/plugins/sosynpl/consts')
require('../../server/models/Application')
require('../../server/models/Expertise')
require('../../server/models/Experience')
require('../../server/models/Training')

jest.setTimeout(30000000)

describe('Profile Completion', ()=> {

  const DBNAME=`test${moment().unix()}`

  let freelance, sector
  
  beforeAll(async () => {
    await mongoose.connect(`mongodb://localhost/${DBNAME}`, MONGOOSE_OPTIONS)
    const jobFile=await JobFile.create({...JOB_FILE_DATA})
    const job=await Job.create({...JOB_DATA, job_file: jobFile})
    sector=await Sector.create({...SECTOR_DATA})
    freelance=(await CustomerFreelance.create({...FREELANCE_DATA, main_job: job, work_sector: [sector],/*picture:"hi",*/ mobility: MOBILITY_CITY, work_mode: WORK_MODE_REMOTE, rate: 5, description: 'hi', company_size: COMPANY_SIZE_LESS_10}))
  })

  afterAll(async () => {
    await mongoose.connection.dropDatabase()
    await mongoose.connection.close()
  })

  it('checks for missing attributes', async() => {
    const fields = ['missing_attributes']
    const [user] = await loadFromDb({model:'customerFreelance', id: freelance._id, fields})
    expect(user.missing_attributes.length).toBeGreaterThanOrEqual(0)
  })

  it('checks for profile completion', async() => {
    const fields = ['profile_completion']
    const [user] = await loadFromDb({model:'customerFreelance', id: freelance._id, fields})
    expect(user.profile_completion).toBeGreaterThanOrEqual(0)
  })
})