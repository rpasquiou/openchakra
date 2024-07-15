const mongoose = require('mongoose')
const moment = require('moment')
const { faker } = require('@faker-js/faker')
const { MONGOOSE_OPTIONS, loadFromDb } = require('../../server/utils/database')
const Announce = require('../../server/models/Announce')
const Job = require('../../server/models/Job')
const Sector = require('../../server/models/Sector')
const Expertise = require('../../server/models/Expertise')
const Software = require('../../server/models/Software')
const LanguageLevel = require('../../server/models/LanguageLevel')
const CustomerFreelance = require('../../server/models/CustomerFreelance')
const SoftSkill = require('../../server/models/SoftSkill')
const JobFile = require('../../server/models/JobFile')
require('../../server/plugins/sosynpl/functions')
require('../../server/plugins/sosynpl/announce')
require('../../server/models/JobFile')
require('../../server/models/Application')


describe('Search', () => {
  let job, sector, expertise1, expertise2, expertise3, software, language, announce, customerFreelance
  let softSkillComm, softSkillConflict, softSkillTeamWork

  beforeAll(async () => {
    const DBNAME = `test${moment().unix()}`
    await mongoose.connect(`mongodb://localhost/${DBNAME}`, MONGOOSE_OPTIONS)

    const jobFile = await JobFile.create({code:'a',name:'a'})
    job = await Job.create({job_file:jobFile._id, name:'Dev'})
    sector = await Sector.create({ name: 'IT' })
    expertise1 = await Expertise.create({ name: 'JavaScript' })
    expertise2 = await Expertise.create({ name: 'Java' })
    expertise3 = await Expertise.create({ name: 'Python' })
    software = await Software.create({ name: 'VS Code' })
    language = await LanguageLevel.create({ language: 'fr', level: 'LANGUAGE_LEVEL_ADVANCED' })
    softSkillComm = await SoftSkill.create({ name: 'Communication', value: 'SOFT_SKILL_COMM' })
    softSkillTeamWork = await SoftSkill.create({ name: 'TeamWork', value: 'SOFT_SKILL_TEAMWORK'})
    softSkillConflict = await SoftSkill.create({ name: 'Conflict', value: 'SOFT_SKILL_CONFLICT'})

    announce = await Announce.create({
      user: new mongoose.Types.ObjectId(),
      job: job._id,
      title: faker.name.jobTitle(),
      experience: ['EXPERIENCE_EXPERT'],
      start_date: moment(),
      duration: faker.datatype.number({ min: 1, max: 12 }),
      duration_unit: 'DURATION_MONTH',
      sectors: [sector._id],
      city: {
        address: faker.address.streetAddress(),
        city: faker.address.city(),
        zip_code: faker.address.zipCode(),
        country: faker.address.country()
      },
      homework_days: faker.datatype.number({ min: 0, max: 5 }),
      mobility: 'MOBILITY_FRANCE',
      mobility_days_per_month: faker.datatype.number({ min: 1, max: 30 }),
      budget: faker.datatype.number({ min: 1000, max: 10000 }),
      budget_hidden: faker.datatype.boolean(),
      expertises: [expertise1._id, expertise2._id, expertise3._id],
      pinned_expertises: [expertise1._id],
      softwares: [software._id],
      languages: [language._id],
      gold_soft_skills: [softSkillComm._id],
      silver_soft_skills: [softSkillTeamWork._id],
      bronze_soft_skills: [softSkillConflict._id],
    })

    customerFreelance = await CustomerFreelance.create({
      password: faker.internet.password(),
      email: faker.internet.email(),
      lastname: faker.name.lastName(),
      firstname: faker.name.firstName(),
      source: 'SOURCE_RECOMMANDATION',
      curriculum: new mongoose.Types.ObjectId(),
      experience: new mongoose.Types.ObjectId(),
      motivation: faker.lorem.sentence(),
      main_job: job._id,
      gold_soft_skills: [softSkillComm._id],
      silver_soft_skills: [softSkillTeamWork._id],
      bronze_soft_skills: [softSkillConflict._id],
      work_sector: [sector._id],
      expertises: [expertise1._id],
      siren: '923145171',
      legal_status: 'EI',
      company_name: faker.company.name(),
      position: faker.name.jobTitle(),
      softwares: [software._id],
      languages: [language._id],
      main_experience: 'EXPERIENCE_EXPERT',
      work_mode: 'WORK_MODE_REMOTE_SITE',
      work_duration: ['WORK_DURATION__1_TO_6_MONTHS'],
      mobility: 'MOBILITY_FRANCE',
      cgu_accepted: true,
      phone: '0606060606',
      address: {
        address: faker.address.streetAddress(),
        city: faker.address.city(),
        zip_code: faker.address.zipCode(),
        country: faker.address.country()
      }
    })
  })

  afterAll(async () => {
    await mongoose.connection.dropDatabase()
    await mongoose.connection.close()
  })

  test('should find suggested freelances based on announce criteria', async () => {
    const loadedAnnounce = await loadFromDb({model:'announce', id:announce._id, 
      fields:'suggested_freelances,gold_soft_skills,silver_soft_skills,bronze_soft_skills,job,sectors,expertises,softwares,languages,experience,_duration_days,duration_unit,duration'.split(',')
    })

    console.log(customerFreelance)
    console.log(announce)
    console.log("suggestion:",loadedAnnounce[0].suggested_freelances)
    console.log("freelance:",customerFreelance.fullname)
  })
})
