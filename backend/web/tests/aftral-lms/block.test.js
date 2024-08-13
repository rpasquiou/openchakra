const mongoose = require('mongoose')
const { MONGOOSE_OPTIONS, loadFromDb } = require('../../server/utils/database')
require('../../server/plugins/aftral-lms/functions')
const User = require('../../server/models/User')
const Resource = require('../../server/models/Resource')
const Sequence = require('../../server/models/Sequence')
const Module = require('../../server/models/Module')
const Program = require('../../server/models/Program')
const Session = require('../../server/models/Session')
const { ROLE_APPRENANT, ROLE_FORMATEUR, RESOURCE_TYPE_PDF, ACHIEVEMENT_RULE_CHECK, ACHIEVEMENT_RULE_SUCCESS, ACHIEVEMENT_RULE_CONSULT, RESOURCE_TYPE_VIDEO, ACHIEVEMENT_RULE_DOWNLOAD, ROLE_CONCEPTEUR, BLOCK_STATUS_CURRENT, BLOCK_STATUS_FINISHED, BLOCK_STATUS_UNAVAILABLE } = require('../../server/plugins/aftral-lms/consts')

jest.setTimeout(60000)

describe('User', () => {
  beforeAll(async () => {
    await mongoose.connect(`mongodb://localhost/aftral-lms`, MONGOOSE_OPTIONS)
  })

  afterAll(async () => {
    await mongoose.connection.close()
  })

  it.only('must return resource session', async()=> {
    const user = await User.findOne({role:ROLE_APPRENANT})
    const id = '66b60f473f1ec37a3a4cd961'
    const [resource] = await loadFromDb({model:'resource', user, id, fields:['session','parent']})
    const [sequence] = await loadFromDb({model:'sequence', user, id:resource.parent, fields:['session','parent']})
    const [modulee] = await loadFromDb({model:'module', user, id:sequence.parent, fields:['session','parent']})
    const [program] = await loadFromDb({model:'program', user, id:modulee.parent, fields:['session','parent']})
    const [session] = await loadFromDb({model:'session', user, id:program.parent, fields:['session','parent']})
    expect(resource.session).toBeTruthy()
    expect(sequence.session).toBeTruthy()
    expect(modulee.session).toBeTruthy()
    expect(program.session).toBeTruthy()
    expect(session.session).not.toBeTruthy()
  })
})