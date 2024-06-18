const mongoose = require('mongoose')
const moment = require('moment')
const path = require('path')
const { MONGOOSE_OPTIONS } = require('../../server/utils/database')
const { importResources } = require('../../server/plugins/aftral-lms/import')

const ORIGINAL_DB=true
const DBNAME=ORIGINAL_DB ? 'aftral-lms' : `test${moment().unix()}`
const DROP=!ORIGINAL_DB

// const ROOT = path.join(__dirname, './data/Ressources')
const ROOT='/home/seb/Téléchargements/resources'

jest.setTimeout(120000)

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

  it('must import resources', async () => {
    return importResources(ROOT, true)
  })


})

