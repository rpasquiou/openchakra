const mongoose = require('mongoose')
const moment = require('moment')
const fs = require('fs')
const lodash = require('lodash')
const path = require('path')
const { MONGOOSE_OPTIONS, getModels } = require('../../server/utils/database')
const Freelance = require('../../server/models/Freelance')
const { buildAttributesException } = require('../utils')
const { WORK_DURATION } = require('../../server/plugins/sosynpl/consts')

jest.setTimeout(60000)

describe('Test models', () => {

  beforeAll(async () => {
    const DBNAME=`test${moment().unix()}`
    await mongoose.connect(`mongodb://localhost/${DBNAME}`, MONGOOSE_OPTIONS)
    console.log('Opened database', DBNAME)
  })
  
  afterAll(async () => {
    await mongoose.connection.dropDatabase()
    await mongoose.connection.close()
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

})

