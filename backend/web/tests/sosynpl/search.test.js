const mongoose = require('mongoose')
const moment = require('moment')
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
const { LANGUAGE_LEVEL_ADVANCED, REGIONS } = require('../../utils/consts')
const { EXPERIENCE_EXPERT, DURATION_MONTH, MOBILITY_FRANCE, SOURCE_RECOMMANDATION, WORK_MODE_REMOTE_SITE, WORK_DURATION__1_TO_6_MONTHS, AVAILABILITY_ON, AVAILABILITY_OFF, MOBILITY_CITY, MOBILITY_NONE, MOBILITY_REGIONS } = require('../../server/plugins/sosynpl/consts')
const { computeDistanceKm } = require('../../utils/functions')
require('../../server/plugins/sosynpl/functions')
require('../../server/plugins/sosynpl/announce')
require('../../server/models/JobFile')
require('../../server/models/Application')


describe('Search', () => {
  let job, sector, expertise1, expertise2, expertise3, software, language, announce, customerFreelance, rouen, msa, dieppe, lyon
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
    language = await LanguageLevel.create({ language: 'fr', level: LANGUAGE_LEVEL_ADVANCED })
    softSkillComm = await SoftSkill.create({ name: 'Communication', value: 'SOFT_SKILL_COMM' })
    softSkillTeamWork = await SoftSkill.create({ name: 'TeamWork', value: 'SOFT_SKILL_TEAMWORK'})
    softSkillConflict = await SoftSkill.create({ name: 'Conflict', value: 'SOFT_SKILL_CONFLICT'})
    rouen = {
      address: 'Place du Vieux-Marché',
      city: 'Rouen',
      zip_code: '76000',
      country: 'France',
      latitude: 49.4431,
      longitude: 1.0993,
    }
    msa = {
      address: 'Place Colbert',
      city: 'Mont Saint Aignan',
      zip_code: '76130',
      country: 'France',
      latitude: 49.4655,
      longitude: 1.0877,
    }
    dieppe = {
      address: 'Place Nationale',
      city: 'Dieppe',
      zip_code: '76200',
      country: 'France',
      latitude: 49.9225,
      longitude: 1.0781,
    }
    lyon = {
      address: 'Place Bellecour',
      city: 'Lyon',
      zip_code: '69002',
      country: 'France',
      latitude: 45.7579,
      longitude: 4.8321,
    }    
    announce = await Announce.create({
      user: new mongoose.Types.ObjectId(),
      job: job._id,
      title: 'Senior Developer',
      experience: [EXPERIENCE_EXPERT],
      start_date: new Date(2024, 6, 20),
      duration: 3, 
      duration_unit: DURATION_MONTH,
      sectors: [sector._id],
      homework_days: 3, 
      mobility: MOBILITY_REGIONS,
      mobility_regions: [Object.keys(REGIONS)[2], Object.keys(REGIONS)[3]],
      mobility_days_per_month: 10, 
      budget: 5000, 
      budget_hidden: false, 
      expertises: [expertise1._id, expertise2._id, expertise3._id],
      pinned_expertises: [expertise1._id],
      softwares: [software._id],
      languages: [language._id],
      gold_soft_skills: [softSkillComm._id],
      silver_soft_skills: [softSkillTeamWork._id],
      bronze_soft_skills: [softSkillConflict._id],
      city: msa,
    })

    customerFreelance = await CustomerFreelance.create({
      password: 'password123',
      availability: AVAILABILITY_OFF,
      available_from: new Date(2024,6,19),
      available_days_per_week: 5,
      email: 'sample@example.com',
      lastname: 'Doe',
      firstname: 'John',
      source: SOURCE_RECOMMANDATION,
      curriculum: new mongoose.Types.ObjectId(),
      experience: new mongoose.Types.ObjectId(),
      motivation: 'Motivated to work on challenging projects',
      main_job: job,
      gold_soft_skills: [softSkillComm._id],
      silver_soft_skills: [softSkillTeamWork._id],
      bronze_soft_skills: [softSkillConflict._id],
      work_sector: [sector._id],
      expertises: [expertise1._id],
      siren: '923145171',
      legal_status: 'EI',
      company_name: 'Sample Company',
      position: 'Lead Developer',
      softwares: [software._id],
      languages: [language._id],
      main_experience: EXPERIENCE_EXPERT,
      work_mode: WORK_MODE_REMOTE_SITE,
      work_duration: [WORK_DURATION__1_TO_6_MONTHS],
      mobility: MOBILITY_CITY,
      mobility_city: rouen,
      mobility_regions: [Object.keys(REGIONS)[3]],
      mobility_city_distance: 10,
      cgu_accepted: true,
      phone: '0606060606',
      address: {
        address: '123 Main St',
        city: 'Sample City',
        zip_code: '12345',
        country: 'Sample Country'
      }
    })
  })

  afterAll(async () => {
    await mongoose.connection.dropDatabase()
    await mongoose.connection.close()
  })

  it('should find suggested freelances based on announce criteria', async () => {
    const loadedAnnounce = await loadFromDb({model:'announce', id:announce._id, 
      fields:'mobility_regions,city,mobility,suggested_freelances,gold_soft_skills,silver_soft_skills,bronze_soft_skills,start_date,job,sectors,expertises,softwares,languages,experience,_duration_days,duration_unit,duration'.split(',')
    })
    const suggestion = loadedAnnounce[0].suggested_freelances[0]
    expect(String(customerFreelance._id)).toMatch(String(suggestion.id))
  })
})