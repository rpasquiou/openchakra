const moment=require('moment')
const mongoose = require('mongoose')
const lodash=require('lodash')
require('../../server/models/Chapter')
require('../../server/plugins/aftral-lms/functions')
const Program=require('../../server/models/Program')
const { MONGOOSE_OPTIONS, loadFromDb } = require('../../server/utils/database')
const ProductCode = require('../../server/models/ProductCode')


jest.setTimeout(20000)

describe('Test models computations', () => {

  beforeAll(async() => {
    await mongoose.connect(`mongodb://localhost/test${moment().unix()}`, MONGOOSE_OPTIONS)
    // Create product codes
    const codes=await Promise.all(lodash.range(5).map(idx => ProductCode.create({code: `Code ${idx+1}`})))
    // Create programs
    await Promise.all(lodash.range(2).map(idx => Program.create({name: `Programme ${idx+1}`, codes:[codes[idx], codes[idx+2]]})))
    // await Program.create({name: 'Programme 3', codes:[codes[4]]})
  })

  afterAll(async() => {
    await mongoose.connection.dropDatabase()
    await mongoose.connection.close()
  })

  it('must create blocks', async() => {
    const programs=await loadFromDb({model: 'program', fields: ['name', 'codes', 'available_codes']})
    expect(programs[0].available_codes.map(c => c.code).sort().join(',')).toEqual('Code 1,Code 3,Code 5')
    expect(programs[1].available_codes.map(c => c.code).sort().join(',')).toEqual('Code 2,Code 4,Code 5')
  })

})
