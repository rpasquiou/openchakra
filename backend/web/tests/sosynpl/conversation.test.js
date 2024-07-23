const mongoose = require('mongoose')
const { MONGOOSE_OPTIONS, loadFromDb } = require('../../server/utils/database')
require('../../server/plugins/sosynpl/functions')
require('../../server/models/Conversation')
require('../../server/models/Job')
require('../../server/models/Sector')
require('../../server/models/JobFile')
const moment = require('moment')
const { CUSTOMER_DATA, JOB_FILE_DATA, JOB_DATA, SECTOR_DATA, CATEGORY_DATA, FREELANCE_DATA, ANNOUNCE_DATA } = require('./data/base_data')
const JobFile = require('../../server/models/JobFile')
const Job = require('../../server/models/Job')
const Sector = require('../../server/models/Sector')
const CustomerFreelance = require('../../server/models/CustomerFreelance')
const HardSkillCategory = require('../../server/models/HardSkillCategory')
const Expertise = require('../../server/models/Expertise')
const LanguageLevel = require('../../server/models/LanguageLevel')
const { LANGUAGE_LEVEL_ADVANCED } = require('../../utils/consts')
const Software = require('../../server/models/Software')
const lodash = require('lodash')
const HardSkill = require('../../server/models/HardSkill')
const Announce = require('../../server/models/Announce')
const Application = require('../../server/models/Application')
const Mission = require('../../server/models/Mission')
const { ROLE_ADMIN } = require('../../server/plugins/sosynpl/consts')

describe('Conversation', () => {
  const DBNAME = `test${moment().unix()}`
  let freelance, customer, application, announce, mission, admin
  let expertise1, expertise2, expertise3, software, sector, language

  beforeAll(async () => {
    await mongoose.connect(`mongodb://localhost/${DBNAME}`, MONGOOSE_OPTIONS)

    const jobFile = await JobFile.create({ ...JOB_FILE_DATA })
    const job = await Job.create({ ...JOB_DATA, job_file: jobFile })
    sector = await Sector.create({ ...SECTOR_DATA })
    const category1 = await HardSkillCategory.create({ ...CATEGORY_DATA, name: 'Catégorie 1' })
    const category2 = await HardSkillCategory.create({ ...CATEGORY_DATA, name: 'Catégorie 2' })
    expertise1 = await Expertise.create({ name: 'JavaScript' })
    expertise2 = await Expertise.create({ name: 'Java' })
    expertise3 = await Expertise.create({ name: 'Python' })
    await Promise.all(lodash.range(4).map(idx => HardSkill.create({ name: `Skill 1-${idx}`, code: '12', job_file: jobFile, category: category1 })))
    await Promise.all(lodash.range(2).map(idx => HardSkill.create({ name: `Skill 2-${idx}`, code: '12', job_file: jobFile, category: category2 })))
    language = await LanguageLevel.create({ language: 'fr', level: LANGUAGE_LEVEL_ADVANCED })
    software = await Software.create({ name: 'VS Code' })

    customer = await CustomerFreelance.create({ ...CUSTOMER_DATA })

    freelance = await CustomerFreelance.create({ ...FREELANCE_DATA, main_job: job, work_sector: [sector] })

    admin = await CustomerFreelance.create({ ...CUSTOMER_DATA, role: ROLE_ADMIN})

    announce = await Announce.create({
      ...ANNOUNCE_DATA,
      user: customer._id,
      sectors: [sector._id],
      expertises: [expertise1._id, expertise2._id, expertise3._id],
      pinned_expertises: [expertise1._id, expertise2._id, expertise3._id],
      softwares: [software._id],
      languages: [language._id],
    })

    application = await Application.create({
      announce: announce._id,
      customer: customer._id,
      freelance: freelance._id,
    })

    mission = await Mission.create({
      application: application._id,
      customer: customer._id,
      freelance: freelance._id,
      title: 'dev',
      start_date: new Date(),
      end_date: new Date('2025-06-06'),
    })
  })

  afterAll(async () => {
    await mongoose.connection.close()
  })

  it('must refuse creating a conversation with a non ADMIN user', async () => {
    try {
      await loadFromDb({ model: 'conversation', user: customer, id: freelance._id, fields: ['messages_count', 'users'] })
      throw new Error('Expected method to reject.')
    } catch (err) {
      expect(err.message).toBe("Vous ne pouvez converser qu'avec un ADMIN ou dans le cadre d'une candidature")
    }
  })
  it('must accept creating a conversation with an ADMIN', async () => {
    const [conv] = await loadFromDb({ model: 'conversation', user: customer, id: admin._id, fields: ['messages_count', 'users'] })
    expect(conv.users.length).toEqual(2)
  })
  it('must accept creating a conversation for an application', async () => {
    const [conv] = await loadFromDb({ model: 'conversation', user: customer, id: application._id, fields: ['messages_count', 'users'] })
    expect(conv.users.length).toEqual(2)
  })
})
