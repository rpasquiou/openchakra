const mongoose = require('mongoose')
const { MONGOOSE_OPTIONS, loadFromDb } = require('../../server/utils/database')
require('../../server/plugins/aftral-lms/functions')
const User = require('../../server/models/User')
const Resource = require('../../server/models/Resource')
const Sequence = require('../../server/models/Sequence')
const Module = require('../../server/models/Module')
const Program = require('../../server/models/Program')
const Session = require('../../server/models/Session')
const ProductCode = require('../../server/models/ProductCode')
const Block = require('../../server/models/Block')
const { ROLE_APPRENANT, ROLE_CONCEPTEUR } = require('../../server/plugins/aftral-lms/consts')

jest.setTimeout(60000)

describe('User', () => {
  beforeAll(async () => {
    await mongoose.connect(`mongodb://localhost/aftral-lms`, MONGOOSE_OPTIONS)
  })
  afterAll(async () => {
    await mongoose.connection.close()
  })
  it('must return if resource is mine', async () => {
    const user = await User.findOne({ role: ROLE_APPRENANT })
    const concepteur = await User.findOne({role: ROLE_CONCEPTEUR})
    let [u] = await loadFromDb({ model: 'user', fields: ['resources'], user, id:user._id })
    let resources = await loadFromDb({ model: 'resource', fields: ['likes','dislikes', 'liked', 'likes_count', 'dislikes_count'], user:concepteur})
    resources = resources.filter(r=> {
      return r.likes.length>0
    })
    console.log(resources[0].likes[0]._id, resources)
    console.log(user._id)
  })
})