const mongoose = require('mongoose')
const path = require('path')
const moment = require('moment')
const { MONGOOSE_OPTIONS } = require('../../server/utils/database')
require('../../server/plugins/sosynpl/functions')
const Report=require('../../server/models/Report')
const Mission = require('../../server/models/Mission')
const { REPORT_STATUS_SENT } = require('../../server/plugins/sosynpl/consts')
require('../../server/models/Quotation')

const DBNAME = 'sosynpl'

describe('Test reports', () => {

  beforeAll(async () => {
    await mongoose.connect(`mongodb://localhost/${DBNAME}`, MONGOOSE_OPTIONS)
    console.log('Opened database', DBNAME)
  })
  
  afterAll(async () => {
    await mongoose.connection.close()
  })

  it('must create a report', async () => {
    const mission=await new Mission({})
    const r=await Report.create({mission})
    const loaded=await Report.findById(r._id).populate('quotation')
  })

})

