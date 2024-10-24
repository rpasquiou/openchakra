const { MONGOOSE_OPTIONS, loadFromDb } = require("../../server/utils/database")
const moment = require('moment')
const mongoose = require('mongoose')
const { SOURCE_RECOMMANDATION, EXPERIENCE_EXPERT, WORK_DURATION__1_TO_6_MONTHS, WORK_MODE_REMOTE, COMPANY_SIZE_LESS_10, MOBILITY_FRANCE, SOFT_SKILL_COMM, SOFT_SKILL_TEAMWORK, SOFT_SKILL_CONFLICT } = require("../../server/plugins/sosynpl/consts")
const CustomerFreelance = require("../../server/models/CustomerFreelance")
const JobFile = require("../../server/models/JobFile")
const Job = require("../../server/models/Job")
const Sector = require("../../server/models/Sector")
const SoftSkill = require("../../server/models/SoftSkill")
const Expertise = require("../../server/models/Expertise")
const Experience = require("../../server/models/Experience")
const Training = require("../../server/models/Training")
require('../../server/plugins/sosynpl/functions')

describe('Freelance Profile Completion', function() {
  // Declare variables out the scope
  let freelance

  beforeAll(async function() {
    
    await mongoose.connect('mongodb://localhost/test' + moment().unix(), MONGOOSE_OPTIONS)

    // Create JobFile
    const jobFile = await JobFile.create({
      code: 'D2003',
      name: 'Informatique'
    })

    // Create Job
    const job = await Job.create({
      name: 'Développeur Fullstack',
      job_file: jobFile._id
    })

    // Create Sector
    const sector = await Sector.create({
      name: 'IT'
    })

    // Create SoftSkill
    const softSkill1 = await SoftSkill.create({
      name: 'Communication',
      value: SOFT_SKILL_COMM
    })
    const softSkill2 = await SoftSkill.create({
      name: 'Collaboration',
      value: SOFT_SKILL_TEAMWORK
    })
    const softSkill3 = await SoftSkill.create({
      name: 'Médiation des conflits',
      value: SOFT_SKILL_CONFLICT
    })

    // Create Expertise
    const expertise1 = await Expertise.create({
      name: 'Développement Web',
    })
    const expertise2 = await Expertise.create({
      name: 'Développement Mobile',
    })
    const expertise3 = await Expertise.create({
      name: 'Développement Backend',
    })

    // Create Freelance
     freelance = await CustomerFreelance.create({
      // Obligatory fields
      firstname: 'John',
      lastname: 'Doe',
      email: 'john.doe@example.com',
      password: 'Password1;',
      source: SOURCE_RECOMMANDATION,
      linkedin: 'https://www.linkedin.com/in/john-doe',
      experience: '16',
      main_experience: EXPERIENCE_EXPERT,
      cgu_accepted: true,
      legal_status: 'EI',
      siren: '913683181',
      phone: '0898787689',
      position: 'Développeur Fullstack Senior',
      motivation: 'Développeur Fullstack expérimenté et motivé',
      position: 'Développeur Fullstack Senior',
      company_name: 'John Doe SAS',
      work_duration: WORK_DURATION__1_TO_6_MONTHS,
      address: {
        address: '123 Rue de la Paix',
        city: 'Paris',
        zip_code: '75000',
        country: 'France',
        latitude: 48.8566,
        longitude: 2.3522
      },
      main_job: job._id,
      work_sector: [sector._id],

      // Secondary fields
      rate: 1000,
      headquarter_address: {
        address: '123 Rue de la Paix',
        city: 'Paris',
        zip_code: '75000',
        country: 'France',
        latitude: 48.8566,
        longitude: 2.3522
      },
      description: 'Je suis un Freelance et je développe des applications web',
      work_mode: WORK_MODE_REMOTE,
      work_company_size: COMPANY_SIZE_LESS_10,
      mobility: MOBILITY_FRANCE,
      gold_soft_skills: [softSkill1._id],
      silver_soft_skills: [softSkill3._id, softSkill2._id],
      bronze_soft_skills: [softSkill1._id, softSkill2._id, softSkill3._id],
      // Need 3 expertises
      expertises: [expertise1._id, expertise2._id, expertise3._id],
    })

    // Create Experience
    const experience = await Experience.create({
      user: freelance._id,
      position: 'Développeur Fullstack Senior',
      start_date: new Date('2020-01-01'),
      end_date: new Date('2020-12-31'),
      description: 'Développement d\'applications web',
      company_name: 'John Doe SAS',
    })

    // Create Training
    const training = await Training.create({
      user: freelance._id,
      title: 'Développement Web',
      start_date: new Date('2020-01-01'),
      end_date: new Date('2020-12-31'),
      description: 'Développement d\'applications web',
      school_name: 'John Doe SAS',
    })

    // console.log('\nAffichage du freelance')
    // console.log(freelance)

    // const user = await loadFromDb({model: 'customerFreelance', id: freelance._id, fields: ['freelance_profile_completion']})
    // console.log('\nAffichage du user')
    // console.log(user)

    return freelance
  })

  afterAll(async function() {
    await mongoose.connection.dropDatabase()
    await mongoose.connection.close()
  })

  it.only('should verify if user is defined & check data', async function() {
    const users = await loadFromDb({model: 'customerFreelance', id: freelance._id, fields: ['freelance_profile_completion', 'freelance_missing_attributes']})
    const user = users[0]
    console.log(user)
    expect(user).toBeDefined()
  })

  it('should return 100% profile completion', async function() {
    const users = await loadFromDb({model: 'customerFreelance', id: freelance._id, fields: ['freelance_profile_completion', 'freelance_missing_attributes']})
    const user = users[0]
    expect(user.freelance_profile_completion).toBe(1)
  })
})