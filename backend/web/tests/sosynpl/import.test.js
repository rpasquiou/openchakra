const mongoose = require('mongoose')
const moment = require('moment')
const lodash = require('lodash')
const path = require('path')
const { MONGOOSE_OPTIONS } = require('../../server/utils/database')
const { importJobs, importSectors, importJobFiles, importJobFileFeatures } = require('../../server/plugins/sosynpl/import')
const { loadCache, saveCache } = require('../../utils/import')

const ORIGINAL_DB=true
const DBNAME=ORIGINAL_DB ? 'sosynpl' : `test${moment().unix()}`
const DROP=!ORIGINAL_DB

const ROOT = path.join(__dirname, './data/')

jest.setTimeout(60000)

describe('Test imports', () => {

  beforeAll(async () => {
    await mongoose.connect(`mongodb://localhost/${DBNAME}`, MONGOOSE_OPTIONS)
    console.log('Opened database', DBNAME)
    loadCache()
  })
  
  afterAll(async () => {
    if (DROP) {
      await mongoose.connection.dropDatabase()
    }
    await mongoose.connection.close()
    saveCache()
  })

  it('must import job files', async () => {
    const res = await importJobFiles(path.join(ROOT, 'Champs So SynpL v2.xlsx'), '2- Fiche Métiers', 2)
  })

  it('must import job files features', async () => {
    const res = await importJobFileFeatures(path.join(ROOT, 'Champs So SynpL v2.xlsx'), '3 - Missions principales', 2)
  })

  it('must import jobs', async () => {
    const res = await importJobs(path.join(ROOT, 'Champs So SynpL v2.xlsx'), `1 - Métiers`, 2)
  })

  it('must import sectors', async () => {
    const res = await importSectors(path.join(ROOT, 'Champs So SynpL v2.xlsx'), `Secteurs`)
  })

})

