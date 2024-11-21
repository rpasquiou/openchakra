const mongoose = require('mongoose')
const fs = require('fs')
const path = require('path')
const { MONGOOSE_OPTIONS } = require('../../server/utils/database')
const { pollNewFiles } = require('../../server/plugins/aftral-lms/ftp')
const User = require('../../server/models/User')
const { ROLE_ADMINISTRATEUR, ROLE_FORMATEUR, ROLE_APPRENANT, isExternalTrainer, BLOCK_TYPE_SESSION } = require('../../server/plugins/aftral-lms/consts')
const { importTrainers, importSessions, importTrainees } = require('../../server/plugins/aftral-lms/import')
const Session = require('../../server/models/Session')
const Block = require('../../server/models/Block')
const { getExchangeDirectory } = require('../../config/config')

jest.setTimeout(600000)

const ROOT = path.join(__dirname, './data')

const TRAINERS_FILE=path.join(ROOT, 'Session_Formateur.csv')
const TRAINEES_FILE=path.join(ROOT, 'Apprenant.csv')

describe('Test session/trainees polling', () => {

  beforeAll(async() => {
    await mongoose.connect(`mongodb://localhost/aftral-lms`, MONGOOSE_OPTIONS)
    const admin=await User.findOne({role: ROLE_ADMINISTRATEUR})
    if (!admin) {
      await User.insert({firstname: 'admin', lastname: 'admin', role: ROLE_ADMINISTRATEUR, email: 'admin@admin.com'})
    }
  })

  afterAll(async() => {
    await mongoose.connection.close()
  })

  it.skip('must poll new files', async() => {
    return pollNewFiles()
  })

  it('Must import trainers', async () => {
    await importTrainers(TRAINERS_FILE).then(console.log)
    let trainers=await User.countDocuments({role: ROLE_FORMATEUR})
    expect(trainers).toEqual(113)
  })

  it('Must import trainees', async () => {
    await importTrainees(TRAINEES_FILE)
    let trainees=await User.countDocuments({role: ROLE_APPRENANT})
    expect(trainees).toEqual(60)
  })

  it('Must import sessions', async () => {
    await importSessions(TRAINERS_FILE, TRAINEES_FILE)
    let sessions=await Block.countDocuments({type: 'session'}) //Session.countDocuments()
    expect(sessions).toBeGreaterThan(0)
  })

  it.only('Must poll files', async () => {
    console.log('echange directory', getExchangeDirectory())
    await fs.utimesSync(path.join(getExchangeDirectory(), 'Apprenant.csv'), new Date(), new Date())
    await fs.utimesSync(path.join(getExchangeDirectory(), 'Session_Formateur.csv'), new Date(), new Date())

    // Clear sessions and Aftral trainers/trainees
    // await Block.remove({type: BLOCK_TYPE_SESSION}).then(res => console.log(`Deleted ${res.deletedCount} sessions`))
    // await User.remove({aftral_id: {$gt : 0}}).then(res => console.log(`Deleted ${res.deletedCount} users`))
    await pollNewFiles()
    const sessions=await Session.find({aftral_id: {$ne: null}}).populate(['trainers', 'trainees', 'children'])
    console.log(sessions.map(s => ({
      name: s.name,
      aftral_id: s.aftral_id,
      children: s.children.length,
      trainers: s.trainers.map(t => t.fullname),
      trainees: s.trainees.map(t => [t.fullname, t.email]),
    })))
  })

  it('Must check internal/external trainer', async () => {
    expect(isExternalTrainer('ddqsdqs@aftral.com')).toBeFalsy()
    expect(isExternalTrainer('ddqsdqs@tagadaaftral.com')).toBeTruthy()
    expect(isExternalTrainer('wil@wappizy.com')).toBeTruthy()
    expect(isExternalTrainer('tagad@aftral.comi')).toBeFalsy()
    expect(isExternalTrainer('tagad@aftral.com')).toBeFalsy()
  })
})
