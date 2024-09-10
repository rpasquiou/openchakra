const moment = require('moment')
const mongoose = require('mongoose')
const lodash = require('lodash')
const { forceDataModelAftral } = require('../utils')
forceDataModelAftral()
const { MONGOOSE_OPTIONS, loadFromDb, callPostCreateData, idEqual, getModel } = require('../../server/utils/database')
const User = require('../../server/models/User')
const Resource = require('../../server/models/Resource')
const Sequence = require('../../server/models/Sequence')
const Module = require('../../server/models/Module')
const Program = require('../../server/models/Program')
const Session = require('../../server/models/Session')
const { ROLE_CONCEPTEUR, RESOURCE_TYPE, ROLE_APPRENANT, ROLE_FORMATEUR, ACHIEVEMENT_RULE_SUCCESS, RESOURCE_TYPE_PDF, RESOURCE_TYPE_LINK, ACHIEVEMENT_RULE_CONSULT } = require('../../server/plugins/aftral-lms/consts')
const { updateAllDurations, updateDuration, lockSession, postCreate } = require('../../server/plugins/aftral-lms/functions')
require('../../server/plugins/aftral-lms/actions')
const Block = require('../../server/models/Block')
const { ACTIONS } = require('../../server/utils/studio/actions')
const { SseKmsEncryptedObjectsStatus } = require('@aws-sdk/client-s3')
const ProductCode = require('../../server/models/ProductCode')
const { addChildAction } = require('../../server/plugins/aftral-lms/actions')
require('../../server/models/Certification')
require('../../server/models/Feed')
require('../../server/models/Badge')

jest.setTimeout(60000)

describe('Test models computations', () => {
  beforeAll(async () => {
    await mongoose.connect(`mongodb://localhost/aftral-lms`, MONGOOSE_OPTIONS)
  })
  afterAll(async () => {
    await mongoose.connection.close()
  })
  it(`must compute time it takes for stats to load`, async () => {
    const id = '66d9c7b7877bf1483d941dbc'
    const user = await mongoose.models.user.findOne({role:ROLE_FORMATEUR})
    const fields = [
      // `sessions.children.children.children.likes_count`,
      // `sessions.children.children.children.dislikes_count`,
      // `sessions.children.children.children.tickets_count`,
      `sessions.children.obtained_badges.picture`,
      `sessions.children.obtained_badges`,
      `sessions.children.achievement_status`,
      `sessions.children.resources_progress`,
      `sessions.children`,
      `sessions.children.type`,
      `sessions.children.name`,
      // `sessions.children.children.description`,
      // `sessions.children.children.success_message`,
      // `sessions.children.children.children.evaluation`,
      // `sessions.children.children.children.code`,
      // `sessions.children.children.children.name`,
      // `sessions.children.children.children.optional`,
      // `sessions.children.children.children.success_message`,
      // `sessions.children.children`,
      // `sessions.children.children.children`,
      // `sessions`,
      // `sessions.children.children.children.children`,
      // `sessions.children.children.children.spent_time_str`,
      // `sessions.children.children.children.masked`,
      // `sessions.children.children.children.achievement_status`,
      // `sessions.children.children.children.access_condition`,
      // `sessions.children.closed`,
      // `sessions.children.children.picture`,
      // `sessions.children.children.type`,
      // `sessions.children.children.name`,
      // `sessions.children.children.closed`,
      // `sessions.children.children.spent_time_str`,
      // `sessions.children.children.achievement_status`,
      // `sessions.children.children.children.type`,
      // `sessions.children.children.children.obtained_badges.picture`,
      // `sessions.children.children.children.obtained_badges`,
      // `sessions.children.order`,
      // `sessions.children.children.order`,
      // `sessions.children.children.children.order`,
      // `sessions.children.children.resources_progress`,
      // `sessions.children.finished_resources_count`,
      // `sessions.children.resources_count`,
      // `sessions.children.children.resources_count`,
      // `sessions.children.children.finished_resources_count`,
      // `sessions.children.children.children.resources_progress`,
      // `sessions.children.children.children.children.name`,
      // `sessions.children.children.children.children.type`,
      // `sessions.children.children.children.children.spent_time_str`,
      // `sessions.children.children.children.children.achievement_status`,
      // `sessions.children.children.children.children.code`,
      // `sessions.children.children.children.children.masked`,
      // `sessions.children.children.children.children.evaluation`,
      // `sessions.children.children.children.children.optional`,
      // `sessions.children.spent_time_str`,
      // `sessions.children.children.children.resources_count`,
      // `sessions.children.children.children.closed`,
      // `sessions.children.children.children.description`,
      // `sessions.children.children.children.finished_resources_count`,
      // `resource_type`,
      // `sessions.evaluation_resources.tickets_count`,
      // `sessions.evaluation_resources.likes_count`,
      // `sessions.evaluation_resources.dislikes_count`,
      // `sessions.evaluation_resources.name`,
      // `sessions.evaluation_resources.homeworks.resource.correction`,
      // `sessions.evaluation_resources.evaluation_resources.note`,
      // `sessions.evaluation_resources.homeworks`,
      // `sessions.evaluation_resources.max_attempts`,
      // `sessions.evaluation_resources.success_note_max`,
      // `sessions.evaluation_resources.resource_type`,
      `sessions.trainers.fullname`,
      `sessions.trainers.email`,
      `sessions.trainers`,
      `sessions.trainers.picture`,
      `sessions.trainees`,
      `sessions.trainees.picture`,
      `sessions.trainees.fullname`,
      `sessions.trainees.email`,
      `code`,
      `name`,
      // `sessions.evaluation_resources.correction`,
      // `sessions.evaluation_resources.success_note_min`,
      // `sessions.evaluation_resources.success_scale`,
      // `sessions.evaluation_resources.homework_limit_date`,
      // `sessions.evaluation_resources.homeworks_submitted_count`,
      // `sessions.evaluation_resources.trainees_count`,
      // `sessions.evaluation_resources`,
      // `sessions.evaluation_resources.evaluation_resources.creator.fullname`,
      // `sessions.evaluation_resources.evaluation_resources`,
      // `sessions.evaluation_resources.evaluation_resources.creator.picture`,
      // `sessions.evaluation_resources.evaluation_resources.creation_date`,
      // `sessions.evaluation_resources.evaluation_resources.homeworks.document`,
      // `sessions.evaluation_resources.evaluation_resources.success_note_max`,
      // `sessions.evaluation_resources.evaluation_resources.scale`,
      // `sessions.evaluation_resources.evaluation_resources.description`,
      // `sessions.evaluation_resources.homeworks_missing_count`,
      // `sessions.children.children.children.children.likes_count`,
      // `sessions.children.children.children.children.dislikes_count`,
      // `sessions.children.children.children.children.tickets_count`,
      // `sessions.children.children.children.children.access_condition`,
      // `sessions.evaluation_resources.evaluation_resources.homeworks`
    ]
    console.time(`stat`)
    const [stat] = await loadFromDb({model: `statistics`, user, fields, id})
    console.timeEnd(`stat`)
    const res = stat.sessions[0]
    delete res.id
    delete res._id
    delete res.trainees
    delete res.trainers
    console.log(JSON.stringify(res, null, 2))
  })
})