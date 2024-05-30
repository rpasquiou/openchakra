const AppointmentType = require('../../server/models/AppointmentType')
require('../../server/models/Job')
require('../../server/models/DeclineReason')
require('../../server/models/JoinReason')
require('../../server/models/FoodDocument')
const mongoose = require('mongoose')

const {forceDataModelSmartdiet, buildAttributesException}=require('../utils')

forceDataModelSmartdiet()

require('../../server/plugins/smartdiet/functions')

const {getDataModel} = require('../../config/config')
const {MONGOOSE_OPTIONS, loadFromDb} = require('../../server/utils/database')
const {ROLE_CUSTOMER, COMPANY_ACTIVITY, ROLE_EXTERNAL_DIET} = require('../../server/plugins/smartdiet/consts')
const User = require('../../server/models/User')
const { getAvailabilities } = require('../../server/plugins/agenda/smartagenda')
const Coaching = require('../../server/models/Coaching')

jest.setTimeout(60000)

describe('Survey ', () => {

  let user;

  beforeAll(async() => {
    await mongoose.connect(`mongodb://localhost/smartdiet`, MONGOOSE_OPTIONS)
  })

  afterAll(async() => {
    await mongoose.connection.close()
  })

  it('must get availabilities', async() => {
    const diet=await User.find({role: ROLE_EXTERNAL_DIET, smartagenda_id: {$ne: null}})
    const availabilities=await getAvailabilities({})
  })

  it.only('Must get available diet', async() => {
    const user=await User.findOne({email: 'hello+test@wappizy.com'})
    let coaching=await Coaching.findOne({user})
    coaching=(await loadFromDb({model: 'coaching', id:coaching._id, fields: ['available_diets']}))[0]
    console.log(coaching.available_diets.length)
  })

})
