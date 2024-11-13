const mongoose = require('mongoose')
const moment = require('moment')
const { MONGOOSE_OPTIONS, loadFromDb } = require('../../server/utils/database')
const ExpertiseCategory = require('../../server/models/ExpertiseCategory')
const { EXPERTISE_CATEGORY_APP_SECURITY } = require('../../server/plugins/cyberleague/consts')
const Expertise = require('../../server/models/Expertise')
require('../../server/plugins/cyberleague/functions')
require('../../server/models/School')
require('../../server/models/ExpertiseSet')
require('../../server/models/Gift')
require('../../server/models/Event')
require('../../server/models/Certification')
require('../../server/models/CustomerSuccess')

let category, expertise
beforeAll(async () => {
  await mongoose.connect(`mongodb://localhost/test${moment().unix()}`, MONGOOSE_OPTIONS)
  category=await ExpertiseCategory.create({value: EXPERTISE_CATEGORY_APP_SECURITY, name: `test`})
  expertise=await Expertise.create({name: 'testExp', category: category._id})
})

afterAll(async () => {
  await mongoose.connection.dropDatabase()
  await mongoose.connection.close()
})

describe(`Expertise test`, () => {
  it('must have correct fields', async () =>{
    const loadedE = await loadFromDb({model: 'expertise', fields:['name','picture','creation_date','category.name','category']})
    console.log(loadedE);
    
    expect(loadedE.length).toEqual(1)
    const loadedExpertise = loadedE[0]
    expect(loadedExpertise.name).toEqual(expertise.name)
    expect(loadedExpertise.creation_date).toEqual(expertise.creation_date)
    expect(loadedExpertise.category.name).toEqual(category.name)
  })
})