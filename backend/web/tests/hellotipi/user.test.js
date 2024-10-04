const mongoose = require('mongoose')
const moment=require('moment')
const {
  COACH_ALLE,
  ROLE_TI
} = require('../../server/plugins/all-inclusive/consts')
const User = require('../../server/models/User')
const Lead = require('../../server/models/Lead')
const JobUser = require('../../server/models/JobUser')
const Recommandation = require('../../server/models/Recommandation')
const Mission = require('../../server/models/Mission')
const Comment = require('../../server/models/Comment')
const { USER_DATA, LEAD_DATA, JOB_USER_DATA, RECOMMANDATION_DATA, MISSION_DATA, COMMENT_DATA } = require('./data/modelsBaseData')
/*const {forceDataModelAllInclusive}=require('../utils')

forceDataModelAllInclusive()*/
require('../../server/plugins/all-inclusive/functions')
const {MONGOOSE_OPTIONS} = require('../../server/utils/database')
const { loadFromDb } = require('../../server/utils/database')

jest.setTimeout(40000)

describe('Test user model', () => {

  beforeAll(async() => {
    await mongoose.connect(`mongodb://localhost/test${moment().unix()}`, MONGOOSE_OPTIONS)

    const user = await User.create({...USER_DATA})

    const job = await JobUser.create({...JOB_USER_DATA, user})

    const mission = await Mission.create({...MISSION_DATA, user: user._id, job: job._id})

    for (const recommandationData of RECOMMANDATION_DATA) {
      await Recommandation.create({user, job, ...recommandationData})
    }

    for (const commentData of COMMENT_DATA) {
      await Comment.create({user, job, mission, ...commentData})
    }
  })

  afterAll(async() => {
    await mongoose.connection.dropDatabase()
    await mongoose.connection.close()
  })

  it.only("Must compute recommandations_count", async() => {
    const [user] = await loadFromDb({
      model: 'user',
        fields: ['recommandations_count'],
    })
    expect(user.recommandations_count).toEqual(2)
  })

  //TODO REFAIRE LE TEST
  it("Must compute recommandations_note", async() => {
    /*const user=await User.findOne()
      .populate({path: 'jobs', populate: {path: 'recommandations'}})
    expect(user.recommandations_note).toEqual(2.5)*/
    const [user] = await loadFromDb({
      model: 'user',
        fields: ['recommandations_note'],
    })
    console.log(user)
    expect(user.recommandations_note).toEqual(2.5)
  })

  //TODO REFAIRE LE TEST
  it("Must compute comments_count", async() => {
    const user=await User.findOne()
      .populate({path: 'jobs', populate: {path: 'comments'}})
    expect(user.comments_count).toEqual(2)
  })

  //TODO REFAIRE LE TEST
  it("Must compute comments_note", async() => {
    const user=await User.findOne()
      .populate({path: 'jobs', populate: {path: 'comments'}})
    expect(user.comments_note).toEqual(3)
  })
})


describe('Test User Model', function () {

  let user
  let lead

  beforeAll(async function () {
    await mongoose.connect(`mongodb://localhost/test${moment().unix()}`, MONGOOSE_OPTIONS)
    user = await User.create({...USER_DATA})

    lead = await Lead.create({
        ...LEAD_DATA,
        creator: user._id
    })
  })

  afterAll(async function () {
    await mongoose.connection.dropDatabase()
    await mongoose.connection.close()
  })

  it('should create a user with the correct data', async function () {
      const foundUser = await User.findOne({ email: USER_DATA.email })

    expect(foundUser).toBeDefined()
    expect(foundUser.firstname).toBe(USER_DATA.firstname)
    expect(foundUser.lastname).toBe(USER_DATA.lastname)
    expect(foundUser.birthday.toISOString()).toBe(new Date(USER_DATA.birthday).toISOString())
    expect(foundUser.cguAccepted).toBe(USER_DATA.cguAccepted)
    expect(foundUser.password).toBeDefined()
    expect(foundUser.email).toBe(USER_DATA.email)
    expect(foundUser.coaching).toBe(USER_DATA.coaching)
    expect(foundUser.role).toBe(USER_DATA.role)
    expect(foundUser.city).toBe(USER_DATA.city)
    expect(foundUser.zip_code).toBe(USER_DATA.zip_code)
    expect(foundUser.address).toBe(USER_DATA.address)
    expect(foundUser.phone).toBe(USER_DATA.phone)
  })

    it('should create a lead with the correct data', async function () {
      const foundLead = await Lead.findOne({ email: LEAD_DATA.email })

        expect(foundLead).toBeDefined()
        expect(foundLead.fullname).toBe(LEAD_DATA.fullname)
        expect(foundLead.email).toBe(LEAD_DATA.email)
        expect(foundLead.creator).toEqual(user._id)
    })

  it('should return the lead of the user with loadFromDb', async function () {
    const foundUser = await User.findOne({email: USER_DATA.email})
    const [userWithLead] = await loadFromDb({
      model: 'user',
      id: foundUser._id,
      fields: ['leads.fullname', 'leads.email'],
    })
  })
})