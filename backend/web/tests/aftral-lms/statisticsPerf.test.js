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
const ProductCode = require('../../server/models/ProductCode')
const { addChildAction } = require('../../server/plugins/aftral-lms/actions')
const { getBlockResources, getRessourceSession } = require('../../server/plugins/aftral-lms/resources')
const Block = require('../../server/models/Block')
const Permission = require('../../server/models/Permission')
const PermissionGroup = require('../../server/models/PermissionGroup')
require('../../server/models/Certification')
require('../../server/models/Feed')

const fields = [
  `sessions.trainees.statistics.evaluation_resources.tickets_count`,
`sessions.trainees.statistics.evaluation_resources.likes_count`,
`sessions.trainees.statistics.evaluation_resources.dislikes_count`,
`sessions.trainees.statistics.evaluation_resources.name`,
`sessions.trainees.statistics.evaluation_resources.success_note_max`,
`sessions.trainees.statistics.evaluation_resources.type`,
`sessions.trainees.statistics.evaluation_resources.correction`,
`sessions.trainees.statistics.evaluation_resources.note`,
`sessions.trainees.statistics.evaluation_resources.scale`,
`sessions.trainees.statistics.evaluation_resources.homework_limit_date`,
`sessions.trainees.statistics.evaluation_resources.homeworks`,
`sessions.trainees.statistics.evaluation_resources.homeworks.document`,
`sessions.trainees.statistics.evaluation_resources`,
`picture`,
`sessions.trainees.statistics.children.obtained_badges.picture`,
`sessions.trainees.statistics.children.obtained_badges`,
`sessions.trainees.statistics.children.achievement_status`,
`sessions.trainees.statistics.children.resources_progress`,
`sessions.trainees.statistics.children.type`,
`sessions.trainees.statistics.children.name`,
`sessions.trainees.statistics.children.children.description`,
`sessions.trainees.statistics.children.children.success_message`,
`sessions.trainees.statistics.children.children.children.evaluation`,
`sessions.trainees.statistics.children.children.children.code`,
`sessions.trainees.statistics.children.children.children.name`,
`sessions.trainees.statistics.children.children.children.optional`,
`sessions.trainees.statistics.children.children.children.success_message`,
`sessions.trainees.statistics.children.children`,
`sessions.trainees.statistics.children.children.children`,
`sessions.trainees.statistics.children.children.children.children`,
`sessions.trainees.statistics.children.children.children.spent_time_str`,
`sessions.trainees.statistics.children.children.children.masked`,
`sessions.trainees.statistics.children.children.children.achievement_status`,
`sessions.trainees.statistics.children.children.children.disliked`,
`sessions.trainees.statistics.children.children.children.liked`,
`sessions.trainees.statistics.children.children.children.access_condition`,
`sessions.trainees.statistics.children.closed`,
`sessions.trainees.statistics.children.children.picture`,
`sessions.trainees.statistics.children.children.type`,
`sessions.trainees.statistics.children.children.name`,
`sessions.trainees.statistics.children.children.closed`,
`sessions.trainees.statistics.children.children.spent_time_str`,
`sessions.trainees.statistics.children.children.achievement_status`,
`sessions.trainees.statistics.children.children.children.type`,
`sessions.trainees.statistics.children.children.children.obtained_badges.picture`,
`sessions.trainees.statistics.children.children.children.obtained_badges`,
`sessions.trainees.statistics.children.order`,
`sessions.trainees.statistics.children.children.order`,
`sessions.trainees.statistics.children.children.children.order`,
`sessions.trainees.statistics.children.children.resources_progress`,
`sessions.trainees.statistics.children.finished_resources_count`,
`sessions.trainees.statistics.children.resources_count`,
`sessions.trainees.statistics.children.children.finished_resources_count`,
`sessions.trainees.statistics.children.children.resources_count`,
`sessions.trainees.statistics.children.children.children.resources_progress`,
`sessions.trainees.statistics.children.children.children.children.name`,
`sessions.trainees.statistics.children.children.children.children.code`,
`sessions.trainees.statistics.children.children.children.children.spent_time_str`,
`sessions.trainees.statistics.children.children.children.children.masked`,
`sessions.trainees.statistics.children.children.children.children.evaluation`,
`sessions.trainees.statistics.children.children.children.children.disliked`,
`sessions.trainees.statistics.children.children.children.children.liked`,
`sessions.trainees.statistics.children.children.children.children.access_condition`,
`sessions.trainees.statistics.children.children.children.children.type`,
`sessions.trainees.statistics.children.children.children.children.achievement_status`,
`sessions.trainees.statistics.children.children.children.children.optional`,
`sessions.trainees.statistics.children.spent_time_str`,
`sessions.trainees.statistics.children.children.children.finished_resources_count`,
`sessions.trainees.statistics.children.children.children.resources_count`,
`sessions.trainees.statistics.children.children.children.closed`,
`sessions.trainees.statistics.children.children.children.description`,
`sessions.trainees.statistics.children`,
`sessions`,
`sessions.trainees.statistics.spent_time_str`,
`sessions.trainees.fullname`,
`sessions.trainees.email`,
`sessions.trainees.statistics.resources_progress`,
`sessions.name`,
`sessions.trainees`,
`sessions.trainees.tickets_count`,
`sessions.trainees.statistics.certificate`
]

jest.setTimeout(60000)

describe('User', () => {
  let trainer
  beforeAll(async () => {
    await mongoose.connect(`mongodb://localhost/aftral-lms`, MONGOOSE_OPTIONS)
    trainer = await User.findOne({ email: `hello+formateur@wappizy.com` })
  })
  afterAll(async () => {
    await mongoose.connection.close()
  })
  it(`checks for statistics perfs`, async () => {
    // console.time('stat')
    const [statistics] = await loadFromDb({
      model: `statistics`,
      user: trainer,
      fields,
      id: '66d9c7b7877bf1483d941dbc'
    })
    const test = statistics.sessions[0].trainees[1].statistics.toObject()
    delete test['children']
    // console.log(JSON.stringify(test, null, 2))
    statistics.sessions.map(s=> s.trainees.map(t => console.log(t.fullname, t.evaluation_resources)))
    // console.timeEnd('stat')
  })
})