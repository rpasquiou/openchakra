const mongoose = require('mongoose')
const fs = require('fs')
const moment = require('moment')
const { MONGOOSE_OPTIONS } = require('../../server/utils/database')
const { pollNewFiles } = require('../../server/plugins/aftral-lms/ftp')
const User = require('../../server/models/User')
const { ROLE_ADMINISTRATEUR, ROLE_FORMATEUR } = require('../../server/plugins/aftral-lms/consts')
const { importTrainers, importSessions } = require('../../server/plugins/aftral-lms/import')
const Session = require('../../server/models/Session')
const ProductCode = require('../../server/models/ProductCode')
const Program = require('../../server/models/Program')

jest.setTimeout(60000)

const TRAINERS_FILE='/home/seb/test/Session_Formateur.csv'
const TRAINEES_FILE='/home/seb/test/Apprenant.csv'

describe('Test session/trainees polling', () => {

  beforeAll(async() => {
    await mongoose.connect(`mongodb://localhost/aftral-lms`, MONGOOSE_OPTIONS)
    await User.create({
      role: ROLE_ADMINISTRATEUR, password: 'Password1;', email: 'a@a.com', firstname: 'Admin', lastname: 'Admin',

    })
  })

  afterAll(async() => {
    await mongoose.connection.close()
  })

  it.skip('must poll new files', async() => {
    return pollNewFiles()
  })

  it.skip('Must import trainers', async () => {
    await importTrainers(TRAINERS_FILE)
    let trainers=await User.countDocuments({role: ROLE_FORMATEUR})
    expect(trainers).toBeGreaterThan(100)
  })

  it('Must import sessions', async () => {
    await importSessions(TRAINEES_FILE)
    let sessions=await Session.countDocuments({role: ROLE_FORMATEUR})
    expect(sessions).toBeGreaterThan(0)
  })

  it('Must find programs', async () => {
    const codeString=`ACWW04,ACWW22,CCWW03,PAWW01,PAWW02,PRWW01,PSEI29,PSEI30,PSEI31,PSEI32,PSEI33,PSEI34,PSEI40,PSPR18`.split(',')
    const codes=await ProductCode.find({code: codeString})
    console.log(codes)
    const programs=await Program.find({codes: codes})
    console.log(programs)
  })

  it.only('Must fix program codes', async () => {
    const contents=fs.readFileSync('/tmp/test').toString().split('\n').map(l => l.split('\t')).filter(l => l.length==2)
    await Program.updateMany({origin: null, _locked: false}, {$unset: {codes: 1}})
    return Promise.all(contents.map(async ([code, title]) => {
      const productCode=await ProductCode.findOne({code}, {code}, {upsert: true})
      const program=await Program.findOne({name: title})
      console.log(title, program)
      // console.log(await Program.findOneAndUpdate({name: title}, {$addToSet: {codes: productCode._id}}))
    }))
  })

})
