const mongoose = require('mongoose')
const moment = require('moment')
const fs = require('fs')
const lodash = require('lodash')
const path = require('path')
const { MONGOOSE_OPTIONS, getModels, loadFromDb } = require('../../server/utils/database')
const Freelance = require('../../server/models/Freelance')
const { buildAttributesException } = require('../utils')
const { WORK_DURATION, SOFT_SKILL_ADAPTATION, SS_MEDALS_BRONZE, SOFT_SKILLS, SOFT_SKILL_ANALYSIS, SOFT_SKILL_COMM, SOFT_SKILL_CONFLICT, SOFT_SKILL_CREATIVE, SOFT_SKILL_ORGANIZATION, SOFT_SKILL_MANAGE, SOFT_SKILL_TEAMWORK, SOFT_SKILL_FEDERATE } = require('../../server/plugins/sosynpl/consts')
const Customer = require('../../server/models/Customer')
const {CUSTOMER_DATA, FREELANCE_DATA, JOB_DATA, JOB_FILE_DATA, SECTOR_DATA, CATEGORY_DATA}=require('./data/base_data')
require('../../server/plugins/sosynpl/functions')
require('../../server/models/Sector')
require('../../server/models/Job')
require('../../server/models/Training')
require('../../server/models/Application')
const HardSkill=require('../../server/models/HardSkill')
const Job = require('../../server/models/Job')
const JobFile = require('../../server/models/JobFile')
const Sector = require('../../server/models/Sector')
const Category = require('../../server/models/Category')
const HardSkillCategory = require('../../server/models/HardSkillCategory')
const SoftSkill = require('../../server/models/SoftSkill')

jest.setTimeout(60000)

describe('Test models', () => {

  let freelanceId;
  beforeAll(async () => {
    const DBNAME=`test${moment().unix()}`
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

  })
  
  afterAll(async () => {
    await mongoose.connection.dropDatabase()
    await mongoose.connection.close()
  })

  it('Must return Address data type', async () => {
    const {training}=getModels()
    expect(training.attributes.school_city.type).toEqual('Address')
    expect(training.attributes.school_name.type).toEqual('String')
    expect(training.attributes.user.type).toEqual('freelance')
  })

  it('must check freelance model', async () => {
    const REQUIRED_ATTRIBUTES='password email secteurs durées CV linkedin experience'.split(' ')
    const requiredRe=buildAttributesException(REQUIRED_ATTRIBUTES)
    expect(Freelance.create({})).rejects.toThrow(requiredRe)
  })

  it('Should return enum values on multiple attributes', async () => {
    const DIR='./server/models'
    const files=fs.readdirSync(DIR).filter(f => !/Schema/i.test(f) && /js$/.test(f)).map(f => f.replace(/\.js$/, ''))
    files.forEach(f => require(path.join('../..', DIR, f)))
    require('../../server/plugins/sosynpl/functions')
    const models=await getModels()
    expect(models.freelance.attributes.work_duration.enumValues).toEqual(WORK_DURATION)
  })

  it('Customer.legal_representant must be synchronized with legal_representant_self', async () => {
    let customer=await Customer.create({...CUSTOMER_DATA, legal_representant_self: false})
    customer=await Customer.findById(customer._id)
    expect(customer.legal_representant_self).toBe(false)
    expect(customer.legal_representant_firstname).toBe(undefined)
    customer.legal_representant_self=true
    await customer.save()
    customer=await Customer.findById(customer._id)
    expect(customer.legal_representant_self).toBe(true)
    expect(customer.legal_representant_firstname).toEqual(customer.firstname)
    customer.legal_representant_self=false
    customer.legal_representant_firstname='Gérard'
    await customer.save()
    customer=await Customer.findById(customer._id)
    expect(customer.legal_representant_self).toBe(false)
    expect(customer.legal_representant_firstname).toEqual('Gérard')
  })

  it('Freelance soft skills', async () => {
    let freelance=null
    const softSkills=lodash.groupBy(await SoftSkill.find(), 'value')
    const loadFreelance = async () => {
      const [f]=await loadFromDb({model: 'freelance', id: freelanceId, 
        fields:['gold_soft_skills','silver_soft_skills','bronze_soft_skills','available_gold_soft_skills', 
        'available_silver_soft_skills', 'available_bronze_soft_skills', 
        'pilar_coordinator','pilar_creator','pilar_director','pilar_implementor','pilar_networker','pilar_optimizer',
        ]
      })
      freelance=f
    }
    await loadFreelance()
    expect(freelance.available_gold_soft_skills).toHaveLength(Object.keys(SOFT_SKILLS).length)

    const p=Freelance.findByIdAndUpdate(
      freelanceId, 
      {gold_soft_skills:[...softSkills[SOFT_SKILL_COMM], ...softSkills[SOFT_SKILL_CREATIVE]]},
      {runValidators: true}
    )
    expect(p).rejects.toThrow(/vous pouvez choisir/i)

    await Freelance.findByIdAndUpdate(
      freelanceId, 
      {gold_soft_skills:softSkills[SOFT_SKILL_COMM]},
      {runValidators: true}
    )
    await loadFreelance()
    expect(freelance.available_silver_soft_skills).toHaveLength(Object.keys(SOFT_SKILLS).length-1)

    await Freelance.findByIdAndUpdate(freelanceId, {silver_soft_skills:softSkills[SOFT_SKILL_ADAPTATION]}, {runValidators: true})
    await loadFreelance()
    expect(freelance.available_bronze_soft_skills).toHaveLength(Object.keys(SOFT_SKILLS).length-2)

    await Freelance.findByIdAndUpdate(freelanceId, {bronze_soft_skills:softSkills[SOFT_SKILL_CONFLICT]}, {runValidators: true})
    await loadFreelance()
    expect(freelance.available_bronze_soft_skills).toHaveLength(Object.keys(SOFT_SKILLS).length-2)

  })

  it('Freelance test CHARLOTTE', async () => {
    const softSkills=await SoftSkill.find()
    await Freelance.findByIdAndUpdate(
      freelanceId, {
        gold_soft_skills:softSkills.filter(s => [SOFT_SKILL_ORGANIZATION].includes(s.value)),
        silver_soft_skills:softSkills.filter(s => [SOFT_SKILL_MANAGE, SOFT_SKILL_CREATIVE].includes(s.value)),
        bronze_soft_skills:softSkills.filter(s => [SOFT_SKILL_COMM, SOFT_SKILL_TEAMWORK, SOFT_SKILL_FEDERATE].includes(s.value)),
      }, 
      {runValidators: true}
    )

    const [freelance]=await loadFromDb({
      model: 'freelance', id: freelanceId, 
      fields:['pilar_coordinator','pilar_creator','pilar_director','pilar_implementor','pilar_networker','pilar_optimizer',],
    })
    const TOTAL=25
    // Check ratios
    expect(freelance.pilar_creator).toEqual(21/TOTAL)
    expect(freelance.pilar_implementor).toEqual(4/TOTAL)
    expect(freelance.pilar_optimizer).toEqual(9/TOTAL)
    expect(freelance.pilar_networker).toEqual(2/TOTAL)
    expect(freelance.pilar_coordinator).toEqual(25/TOTAL)
    expect(freelance.pilar_director).toEqual(5/TOTAL)
  })

  it('must return hard skills categories', async () => {
    const [freelance]=await loadFromDb({model: 'freelance', id: freelanceId, fields:['hard_skills_categories'], user: await Freelance.findById(freelanceId)})
    expect(freelance.hard_skills_categories).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          "name": "Catégorie 1",
          progress: 2/3,
        }),
        expect.objectContaining({
          "name": "Catégorie 2",
          progress: 1/3,
        })

      ])

    )
  })
})

