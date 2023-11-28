const { CREATED_AT_ATTRIBUTE } = require('../../utils/consts')
const moment = require('moment')
const mongoose = require('mongoose')
const {MONGOOSE_OPTIONS} = require('../../server/utils/database')

const User = require('../../server/models/User')
const {
  createUser,
  getNonce,
  getUsers,
  getMeasures,
  getAuthorizationCode,
  getDevices,
} = require('../../server/utils/withings')
const {forceDataModelDekuple} = require('../utils')
const {isDevelopment}=require('../../config/config')
const {GENDER_MALE} = require('../../server/plugins/dekuple/consts')
const {updateTokens} = require('../../server/plugins/dekuple/functions')

forceDataModelDekuple()

describe('Test withings calls on test DB', () => {

  beforeAll(async() => {
    await mongoose.connect(`mongodb://localhost/test${moment().unix()}`, MONGOOSE_OPTIONS)
  })

  afterAll(async() => {
    await mongoose.connection.dropDatabase()
    await mongoose.connection.close()
  })

  it('must return a nonce', async() => {
    return expect(getNonce()).resolves.toBeTruthy()
  })

  it.only('must create a user', async() => {
    const userdata={
      height: 170, weight: 68, gender: GENDER_MALE, email: 'sebastien.auvray@free.fr',
      firstname: 'Sébastien', lastname: 'Auvray', birthday: moment().add(-50, 'years'),
      cguAccepted: true, dataTreatmentAccepted: true}
    
    const user=await User.create({...userdata})
    const usercode=await createUser(user)
    expect(user.withings_usercode).toBeTruthy()
    expect(user.access_token).toBeFalsy()
    await updateTokens(user)
    const prevToken=user.access_token
    expect(prevToken).toBeTruthy()
    await updateTokens(user)
    const currToken=user.access_token
    expect(currToken).toBeTruthy()
    expect(currToken).not.toEqual(prevToken)
  })

  it('must return the users)', async() => {
    expect(getUsers()).resolves.toBeTruthy()
  })

  it('must return the measures)', async() => {
    const user=await User.findOne()
    console.log(user[CREATED_AT_ATTRIBUTE])
    const since=moment().add(-4, 'days')
    const measures=await getMeasures(user.access_token, since)
    const fmtMeasures={
      ...measures,
      measuregrps: measures.measuregrps.map(g => ({...g, date: moment.unix(g.date)})),
    }
    expect(measures).toBeTruthy()
  })


})

