const {MONGOOSE_OPTIONS, loadFromDb} = require('../../server/utils/database')
const mongoose = require('mongoose')
require('../../server/plugins/all-inclusive/functions')
const User = require('../../server/models/User')
require('../../server/models/Activity')
require('../../server/models/Skill')
require('../../server/models/Recommandation')

jest.setTimeout(20000)

describe('Populate bug', () => {

  beforeAll(async() => {
    await mongoose.connect(`mongodb://localhost/all-inclusive`, MONGOOSE_OPTIONS)
  })

  afterAll(async() => {
    await mongoose.connection.close()
  })

  it("Must load populated", async() => {
    const user=await User.findOne()
    const FIELDS='rate_str,user.picture,name,user.firstname,city,activities.name,activities,search_field,recommandations_count,user.availability,experience'.split(',')
    let fields=[]
    for (const field of FIELDS) {
      fields.push(field)
      try {
        await loadFromDb({model: 'jobUser', user, fields})
        console.log('field', field, 'ok')
      }
      catch(err) {
        throw new Error(`${field}:${err}`)

      }
    }
  })

})
