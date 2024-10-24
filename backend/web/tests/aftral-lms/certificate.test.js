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
const { ROLE_APPRENANT } = require('../../server/plugins/aftral-lms/consts')
const path = require('path')
const { exec } = require('child_process')
const moment = require('moment')
const { getFormFields } = require('../../utils/fillForm')

const ROOT = path.join(__dirname, './../data/pdf')
const FILEPATH = path.join(ROOT, 't.pdf')

jest.setTimeout(60000)

describe('Certificates', () => {
  beforeAll(async () => {
    await mongoose.connect(`mongodb://localhost/aftral-lms`, MONGOOSE_OPTIONS)
  })

  afterAll(async () => {
    await mongoose.connection.close()
  })

  it.only('must retrieve PDF fields', async () => {
    const fields = await getFormFields(FILEPATH)
    console.log(JSON.stringify(Object.keys(fields), null, 2))
  })

  it.only('Must return certificate 1', async () => {
    const user = await User.findOne({role:ROLE_APPRENANT})
    const id = '66b0f1d83356935c1fdaa149'
    const program = await loadFromDb({model:'program', user, id, fields:['certificate']})
    const res = await exec(`xdg-open ${program.certificate}`)
    // console.log(program)
  })
})