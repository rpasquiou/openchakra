const mongoose = require('mongoose')
const moment = require('moment')
const fs = require('fs')
const lodash = require('lodash')
const path = require('path')
const { MONGOOSE_OPTIONS, getModels } = require('../../server/utils/database')
const Freelance = require('../../server/models/Freelance')
const { buildAttributesException } = require('../utils')
const { WORK_DURATION, SOFT_SKILL_ADAPTATION, SS_MEDALS_BRONZE, SOFT_SKILLS, SOFT_SKILL_ANALYSIS, SOFT_SKILL_COMM } = require('../../server/plugins/sosynpl/consts')
const Customer = require('../../server/models/Customer')
const {CUSTOMER_DATA, FREELANCE_DATA, JOB_DATA, JOB_FILE_DATA, SECTOR_DATA, CATEGORY_DATA}=require('./data/base_data')
require('../../server/plugins/sosynpl/functions')
require('../../server/models/Sector')
require('../../server/models/Job')
require('../../server/models/Training')
const HardSkill=require('../../server/models/HardSkill')
const Job = require('../../server/models/Job')
const JobFile = require('../../server/models/JobFile')
const Sector = require('../../server/models/Sector')
const Category = require('../../server/models/Category')
const HardSkillCategory = require('../../server/models/HardSkillCategory')

jest.setTimeout(60000)

describe('Test models', () => {

  beforeAll(async () => {
    const DBNAME=`test${moment().unix()}`
    await mongoose.connect(`mongodb://localhost/${DBNAME}`, MONGOOSE_OPTIONS)
    console.log('Opened database', DBNAME)
    const jobFile=await JobFile.create({...JOB_FILE_DATA})
    const job=await Job.create({...JOB_DATA, job_file: jobFile})
    const sector=await Sector.create({...SECTOR_DATA})
    const category=await HardSkillCategory.create({...CATEGORY_DATA})
    await Freelance.create({...FREELANCE_DATA, main_job: job, work_sector: [sector]})
    await Promise.all(lodash.range(30).map(idx => HardSkill.create({name: `Skill ${idx}`, code: '12', job_file: jobFile, category})))

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
    console.log(customer)
    expect(customer.legal_representant_self).toBe(false)
    expect(customer.legal_representant_firstname).toEqual('Gérard')
  })

  it('Freelance must accept max 20 job skills', async () => {
    const skills=await HardSkill.find()
    const freelance=await Freelance.findOne()
    freelance.hard_skills_job=skills
    expect(freelance.save()).rejects.toThrow('compétences métier')
    freelance.hard_skills_extra=skills.slice(0, 10)
    expect(await freelance.save()).not.toThrow()
  })

  it('Freelance must accept max 20 extra skills', async () => {
    const skills=await HardSkill.find()
    const freelance=await Freelance.findOne()
    freelance.hard_skills_extra=skills
    expect(await freelance.save()).rejects.toThrow('compétences hors métier')
    freelance.hard_skills_extra=skills.slice(0, 10)
    expect(await freelance.save()).not.toThrow()
  })

  it.only('Freelance soft skills', async () => {
    let freelance=await Freelance.findOne().populate('available_soft_skills')
    expect(freelance.available_soft_skills).toHaveLength(Object.keys(SOFT_SKILLS).length)
    freelance.gold_soft_skills=[SOFT_SKILL_ADAPTATION]
    await freelance.save()
    freelance=await Freelance.findOne().populate('available_soft_skills')
    expect(freelance.available_soft_skills).toHaveLength(Object.keys(SOFT_SKILLS).length-1)
    freelance.silver_soft_skills=[SOFT_SKILL_ANALYSIS]
    await freelance.save()
    freelance=await Freelance.findOne().populate('available_soft_skills')
    expect(freelance.available_soft_skills).toHaveLength(Object.keys(SOFT_SKILLS).length-2)
    freelance.bronze_soft_skills=[SOFT_SKILL_COMM]
    await freelance.save()
    freelance=await Freelance.findOne().populate('available_soft_skills')
    expect(freelance.available_soft_skills).toHaveLength(Object.keys(SOFT_SKILLS).length-3)
  })

})

