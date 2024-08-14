const mongoose = require('mongoose')
const { MONGOOSE_OPTIONS, loadFromDb } = require('../../server/utils/database')
require('../../server/plugins/aftral-lms/functions')
const User = require('../../server/models/User')
const Resource = require('../../server/models/Resource')
const Sequence = require('../../server/models/Sequence')
const Module = require('../../server/models/Module')
const Program = require('../../server/models/Program')
const Session = require('../../server/models/Session')
const Comment = require('../../server/models/Comment')
const Post = require('../../server/models/Post')
const { FEED_TYPE_GENERAL, ROLE_APPRENANT } = require('../../server/plugins/aftral-lms/consts')

describe('Post', () => {
  let post, user, comment
  beforeAll(async() => {
    await mongoose.connect(`mongodb://localhost/aftral-test`, MONGOOSE_OPTIONS)
    
    user = await User.create({
      role: ROLE_APPRENANT,
      email: `a@a.com`,
      password: `Je déteste Python`,
      firstname: `John`,
      lastname: `Doe`,
    })

    post = await Post.create({
      contents: 'test',
      author: user._id,
      _feed_type: FEED_TYPE_GENERAL,
      _feed: 'general',
    })

    comment = await Comment.create({
      content: 'Test comment',
      user: user._id,
      post: post._id
    })
  })
  afterAll(async() => {
    await mongoose.connection.dropDatabase()
    await mongoose.connection.close()
  })
  it('must return comments on post', async() => {
    const posts = await loadFromDb({model:'post', user, fields:['comments']})
    console.log(posts)
  })
})