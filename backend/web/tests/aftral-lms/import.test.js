const mongoose = require('mongoose')
const moment = require('moment')
const path = require('path')
const { MONGOOSE_OPTIONS } = require('../../server/utils/database')
const { importResources, importPrograms, importCodes } = require('../../server/plugins/aftral-lms/import')

const ORIGINAL_DB=true
const DBNAME=ORIGINAL_DB ? 'aftral-lms' : `test${moment().unix()}`
const DROP=!ORIGINAL_DB

// const ROOT = path.join(__dirname, './data/Ressources')
const RESOURCES_ROOT='/home/seb/Téléchargements/resources/Current'
const PROGRAMS_PATH='/home/seb/Téléchargements/Aftral Programmes détails.xlsx'
const CODES_PATH='/home/seb/Téléchargements/Code produit à jour 20062024.xlsx'

jest.setTimeout(20*60*1000)

describe('Test imports', () => {

  beforeAll(async () => {
    await mongoose.connect(`mongodb://localhost/${DBNAME}`, MONGOOSE_OPTIONS)
    console.log('Opened database', DBNAME)
  })
  
  afterAll(async () => {
    if (DROP) {
      await mongoose.connection.dropDatabase()
    }
    await mongoose.connection.close()
  })

  it.skip('must import resources', async () => {
    return importResources(RESOURCES_ROOT, true)
  })

  it.skip('must import product codes', async () => {
    return importCodes(CODES_PATH, 'Code produit à jour', 1)
  })

  it.only('must import programs', async () => {
    return importPrograms(PROGRAMS_PATH, 'Final', 1)
  })



})

