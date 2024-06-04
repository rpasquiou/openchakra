const mongoose = require('mongoose')
const moment = require('moment')
const lodash = require('lodash')
const path = require('path')
const { MONGOOSE_OPTIONS } = require('../../server/utils/database')
const { importJobs, importSectors, importJobFiles, importJobFileFeatures, importHardSkills, fixFiles, importCategories1, importCategories2, importExpCategories, importExpertises } = require('../../server/plugins/sosynpl/import')
const { loadCache, saveCache, displayCache } = require('../../utils/import')

const HardSkill=require('../../server/models/HardSkill')
const Sector=require('../../server/models/Sector')
const JobFile = require('../../server/models/JobFile')
const JobFileFeature = require('../../server/models/JobFileFeature')
const Job = require('../../server/models/Job')
const HardSkillCategory = require('../../server/models/HardSkillCategory')
const { SKILLS } = require('../../utils/consts')

const ORIGINAL_DB=true
const DBNAME=ORIGINAL_DB ? 'sosynpl' : `test${moment().unix()}`
const DROP=!ORIGINAL_DB

const ROOT = path.join(__dirname, './data/')

jest.setTimeout(60000)

describe('Test imports', () => {

  beforeAll(async () => {
    await mongoose.connect(`mongodb://localhost/${DBNAME}`, MONGOOSE_OPTIONS)
    console.log('Opened database', DBNAME)
    await loadCache()
  })
  
  afterAll(async () => {
    if (DROP) {
      await mongoose.connection.dropDatabase()
    }
    await mongoose.connection.close()
    saveCache()
  })

  it('must import job files', async () => {
    await importJobFiles(path.join(ROOT, 'Base métiers.xlsx'), '1- Fiche Métiers', 1)
    expect(await JobFile.countDocuments()).toEqual(41)
  })

  it('must import job files features', async () => {
    await importJobFileFeatures(path.join(ROOT, 'Base métiers.xlsx'), '3 - Missions principales', 1)
    expect(await JobFileFeature.countDocuments()).toEqual(116)
  })

  it('must import jobs', async () => {
    await importJobs(path.join(ROOT, 'Base métiers.xlsx'), `2 - Métiers`, 1)
    expect(await Job.countDocuments()).toEqual(446)
  })

  it('must import skills categories level 1', async () => {
    await importCategories1(path.join(ROOT, 'Base métiers.xlsx'), `4 - Savoir faire`, 1)
    expect(await HardSkillCategory.countDocuments({parent: null})).toEqual(7)
  })

  it('must import skills categories level 2', async () => {
    await importCategories2(path.join(ROOT, 'Base métiers.xlsx'), `4 - Savoir faire`, 1)
    expect(await HardSkillCategory.find({parent: {$ne:null}})).toHaveLength(35)
  })

  it('must import hard skills', async () => {
    await importHardSkills(path.join(ROOT, 'Base métiers.xlsx'), `4 - Savoir faire`, 1)
    expect(await HardSkill.countDocuments()).toEqual(1484)
  })

  it('must import sectors', async () => {
    await importSectors(path.join(ROOT, 'Champs So SynpL v2.xlsx'), `Secteurs`)
    const sectors=await Sector.find()
    expect(sectors).not.toHaveLength(0)
  })  

  it.skip('must import expertises', async () => {
    await importExpertises(path.join(ROOT, 'Base métiers.xlsx'), `5 - Compétences`, 1)
    // Each skill's category lust have a parent
  })

})

