const mongoose = require('mongoose')
const moment = require('moment')
const lodash = require('lodash')
const path = require('path')
const { MONGOOSE_OPTIONS } = require('../../server/utils/database')
const Freelance = require('../../server/models/Freelance')
const { buildAttributesException } = require('../utils')

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

})

