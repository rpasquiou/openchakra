const mongoose = require('mongoose')
const fs = require('fs')
const moment = require('moment')
const { MONGOOSE_OPTIONS } = require('../../server/utils/database')
const { pollNewFiles } = require('../../server/plugins/aftral-lms/ftp')
const User = require('../../server/models/User')
const { ROLE_ADMINISTRATEUR, ROLE_FORMATEUR, ROLE_APPRENANT } = require('../../server/plugins/aftral-lms/consts')
const { importTrainers, importSessions, importTrainees } = require('../../server/plugins/aftral-lms/import')
const Session = require('../../server/models/Session')
const ProductCode = require('../../server/models/ProductCode')
const Program = require('../../server/models/Program')

jest.setTimeout(600000)

const TRAINERS_FILE='/home/seb/Téléchargements/Session_Formateur.csv'
const TRAINEES_FILE='/home/seb/Téléchargements/Apprenant.csv'

describe('Test session/trainees polling', () => {

  beforeAll(async() => {
    await mongoose.connect(`mongodb://localhost/aftral-lms`, MONGOOSE_OPTIONS)
    await User.findOneAndUpdate(
      {role: ROLE_ADMINISTRATEUR},
      {role: ROLE_ADMINISTRATEUR, email: 'admin@admin.com'}, 
      {upsert: true}
    )
    .then(console.log)

  })

  afterAll(async() => {
    await mongoose.connection.close()
  })

  it.skip('must poll new files', async() => {
    return pollNewFiles()
  })

  it('Must import trainers', async () => {
    await importTrainers(TRAINERS_FILE)
    let trainers=await User.countDocuments({role: ROLE_FORMATEUR})
    expect(trainers).toEqual(113)
  })

  it('Must import trainees', async () => {
    await importTrainees(TRAINEES_FILE)
    let trainees=await User.countDocuments({role: ROLE_APPRENANT})
    expect(trainees).toEqual(60)
  })

  it.only('Must import sessions', async () => {
    await importSessions(TRAINERS_FILE, TRAINEES_FILE)
    let sessions=await Session.countDocuments()
    expect(sessions).toBeGreaterThan(0)
  })

})
