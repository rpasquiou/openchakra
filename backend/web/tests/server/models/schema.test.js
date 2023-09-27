const mongoose=require('mongoose')
const moment=require('moment')
const {MONGOOSE_OPTIONS} = require('../../../server/utils/database')
const { schemaOptions } = require('../../../server/utils/schemas')

const Schema = mongoose.Schema;

describe('Virtuals test', () => {

  let Model

  beforeAll(async() => {
    await mongoose.connect(`mongodb://localhost/test${moment().unix()}`, MONGOOSE_OPTIONS)
    const schema=mongoose.Schema({
      firstname: { type: String}
    }, {virtuals: true})
    schema.virtual('fullname').get(function() { return `${this.firstname} ${this.lastname}`})
    Model=mongoose.model('model', schema)
    schema.add({lastname: {type: String, required: true}})
  })

  afterAll(async() => {
    await mongoose.connection.dropDatabase()
    await mongoose.connection.close()
  })

  test('Load complex virtual', async () => {
    await Model.create({firstname: 'firstname', lastname: 'lastname'})
    const model=await Model.findOne()
    console.log(model.fullname)
  })
 
  test.only('findById', async () => {
    await Model.findById('64ee7086dc3dfc79d1dfd7f7')
  })

})
