const mongoose = require('mongoose')
const lodash = require('lodash')
const { MONGOOSE_OPTIONS } = require('../../server/utils/database')
const Freelance = require('../../server/models/Freelance')
const JobFile = require('../../server/models/JobFile')
const { JOB_FILE_DATA, JOB_DATA, SECTOR_DATA, CATEGORY_DATA, FREELANCE_DATA, CUSTOMER_DATA } = require('./data/base_data')
const Job = require('../../server/models/Job')
const Sector = require('../../server/models/Sector')
const HardSkillCategory = require('../../server/models/HardSkillCategory')
const HardSkill = require('../../server/models/HardSkill')
const Customer = require('../../server/models/Customer')
const Announce = require('../../server/models/Announce')
const { EXPERIENCE, DURATION_UNIT_DAYS, DURATION_UNIT, MOBILITY_NONE, DURATION_MONTH } = require('../../server/plugins/sosynpl/consts')

jest.setTimeout(30000000)

describe('Evaluation', ()=> {
  let freelanceId, customerId, announce, application, evaluation, sector
  beforeAll(async () => {
    const DBNAME=`evalTest`
    await mongoose.connect(`mongodb://localhost/${DBNAME}`, MONGOOSE_OPTIONS)
    console.log('Opened database', DBNAME)
    const jobFile=await JobFile.create({...JOB_FILE_DATA})
    const job=await Job.create({...JOB_DATA, job_file: jobFile})
    const sector=await Sector.create({...SECTOR_DATA})
    const category1=await HardSkillCategory.create({...CATEGORY_DATA, name: `Catégorie 1`})
    const category2=await HardSkillCategory.create({...CATEGORY_DATA, name: `Catégorie 2`})
    freelanceId=(await Freelance.create({...FREELANCE_DATA, main_job: job, work_sector: [sector]}))._id
    await Promise.all(lodash.range(4).map(idx => HardSkill.create({name: `Skill 1-${idx}`, code: '12', job_file: jobFile, category: category1})))
    await Promise.all(lodash.range(2).map(idx => HardSkill.create({name: `Skill 2-${idx}`, code: '12', job_file: jobFile, category: category2})))

    const rouen = {
      address: 'Place du Vieux-Marché',
      city: 'Rouen',
      zip_code: '76000',
      country: 'France',
      latitude: 49.4431,
      longitude: 1.0993,
    }

    customerId=await Customer.create({...CUSTOMER_DATA})._id

    const announce=await Announce.create({
      user:customerId, 
      title:'dev',
      experience: Object.keys(EXPERIENCE)[0], 
      duration: 2,
      duration_unit: DURATION_MONTH,
      budget: '6969669',
      mobility_days_per_month : 2,
      mobility: MOBILITY_NONE,
      city: rouen,
      sectors: [sector._id]
    })
  })
  
  afterAll(async () => {
    await mongoose.connection.dropDatabase()
    await mongoose.connection.close()
  })

  it('must get evaluations', async()=>{
  })
})