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

const removeAttributes = (obj, attributes) => {
  attributes.forEach(attr => {
    delete obj[attr]
  })

  if (Array.isArray(obj.children)) {
    obj.children.forEach(child => removeAttributes(child, attributes))
  }
}

describe('Test models computations', () => {
  beforeAll(async () => {
    await mongoose.connect(`mongodb://localhost/aftral-lms`, MONGOOSE_OPTIONS)
  })
  afterAll(async () => {
    await mongoose.connection.close()
  })
  it(`must compute time it takes for stats to load`, async () => {
    const id = '65bd635bb19ef201d3e91aae-66d8afd04be164492f7b28a9'
    const user = await mongoose.models.user.findOne({role:ROLE_FORMATEUR})
    const fields = [
      `sessions`,
      `sessions.trainees`,
      `sessions.trainees.statistics`,
      `sessions.trainees.statistics`,
      `sessions.trainees.statistics.evaluation_resources`,
      `sessions.trainees.statistics.evaluation_resources.homeworks`,
      `sessions.trainees.statistics.evaluation_resources.homeworks.creation_date`
    ]
    
    // console.time(`stat`)
    const [stat] = await loadFromDb({ model: 'statistics', user, fields, id })
    // console.timeEnd(`stat`)
    // stat.sessions[0].trainees[0].evaluation_resources
    stat.sessions[0].trainees[0].statistics.evaluation_resources.map(r=> console.log(r._id, r.homeworks))
  })
})