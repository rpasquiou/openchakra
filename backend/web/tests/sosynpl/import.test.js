const mongoose = require('mongoose')
const moment = require('moment')
const lodash = require('lodash')
const path = require('path')
const { MONGOOSE_OPTIONS } = require('../../server/utils/database')
const { importJobs, importSectors, importJobFiles, importJobFileFeatures, importHardSkills, fixFiles, importCategories1, importCategories2 } = require('../../server/plugins/sosynpl/import')
const { loadCache, saveCache } = require('../../utils/import')

const HardSkill=require('../../server/models/HardSkill')
const Sector=require('../../server/models/Sector')

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
    await fixFiles(ROOT)
  })
  
  afterAll(async () => {
    if (DROP) {
      await mongoose.connection.dropDatabase()
    }
    await mongoose.connection.close()
    saveCache()
  })

  it('must import job files', async () => {
    return importJobFiles(path.join(ROOT, 'Champs So SynpL v2.xlsx'), '2- Fiche Métiers', 2)
  })

  it('must import job files features', async () => {
    return importJobFileFeatures(path.join(ROOT, 'Champs So SynpL v2.xlsx'), '3 - Missions principales', 2)
  })

  it('must import jobs', async () => {
    return importJobs(path.join(ROOT, 'Champs So SynpL v2.xlsx'), `1 - Métiers`, 2)
  })

  it('must import sectors', async () => {
    await importSectors(path.join(ROOT, 'Champs So SynpL v2.xlsx'), `Secteurs`)
    const sectors=await Sector.find()
    expect(sectors).not.toHaveLength(0)
  })

  it('must import skills categories level 1', async () => {
    return importCategories1(path.join(ROOT, 'Champs So SynpL v2.xlsx'), `4 - Compétences savoir faire`, 2)
  })

  it('must import skills categories level 2', async () => {
    return importCategories2(path.join(ROOT, 'Champs So SynpL v2.xlsx'), `4 - Compétences savoir faire`, 2)
  })

  it('must import hard skills', async () => {
    await importHardSkills(path.join(ROOT, 'wapp_hardskills.csv'))
    // Each skill's category lust have a parent
    const skills=await HardSkill.find().populate('category')
    expect(skills.filter(s => !s.category.parent)).toHaveLength(0)
  })

})

