const moment=require('moment')
const mongoose = require('mongoose')
const lodash=require('lodash')
const {forceDataModelAftral}=require('../utils')
forceDataModelAftral()
const {MONGOOSE_OPTIONS, loadFromDb} = require('../../server/utils/database')
const User=require('../../server/models/User')
require('../../server/models/Chapter')
const Resource=require('../../server/models/Resource')
require('../../server/models/Badge')
const Sequence=require('../../server/models/Sequence')
const Module=require('../../server/models/Module')
const Program=require('../../server/models/Program')
const Session=require('../../server/models/Session')
const { ROLE_CONCEPTEUR, RESOURCE_TYPE, ROLE_APPRENANT, ROLE_FORMATEUR } = require('../../server/plugins/aftral-lms/consts')
const { updateAllDurations, updateDuration, lockSession } = require('../../server/plugins/aftral-lms/functions')
require('../../server/plugins/aftral-lms/actions')
const Block = require('../../server/models/Block')
const { ACTIONS } = require('../../server/utils/studio/actions')
const { SseKmsEncryptedObjectsStatus } = require('@aws-sdk/client-s3')
const { getDatabaseUri } = require('../../config/config')
const { ChainCache, ATTRIBUTES_CACHE } = require('../../server/plugins/aftral-lms/block')


jest.setTimeout(60000)

describe('Test performances', () => {

  beforeAll(async() => {
    await mongoose.connect(getDatabaseUri(), MONGOOSE_OPTIONS)
  })

  afterAll(async() => {
    await mongoose.connection.close()
  })

  it('must load programs', async() => {
    const builder=await User.findOne({role: ROLE_CONCEPTEUR})
    const FIELDS='name,children.children.picture,children.children.name,children.children.children_count,children.children.creation_date,children.children.update_date,children.children.badges.picture,children.children.badges,children.children.search_text,children.children.description,children.children.children.evaluation,children.children.children.code,children.children.children.name,children.children.children.resource_type,children.children.children.search_text,children.children.children.achievement_rule,children.children.children.optional,children.children.children.creation_date,children.children.children.update_date,children.children.children.access_condition,children.children.children.masked,children.children.children,children.children.success_message,children.children,children.picture,children.name,children.children_count,children.badges.picture,children.description,children.creation_date,children.update_date,children.search_text,codes.code,search_text,children_count,badges.picture,description,creation_date,update_date,status,available_codes.code,codes,closed,badges,children.badges,children,last_updater.firstname,last_updater.lastname,creator.lastname,creator.firstname,children.children.children.homework_mode,children.children.children.picture,children.children.children.children_count,children.children.children.badges.picture,children.children.children.badges,children.children.children.description,children.children.children.children.evaluation,children.children.children.children.homework_mode,children.children.children.children.code,children.children.children.children.name,children.children.children.children.resource_type,children.children.children.children.search_text,children.children.children.children.achievement_rule,children.children.children.children.optional,children.children.children.children.creation_date,children.children.children.children.update_date,children.children.children.children.access_condition,children.children.children.children.masked,children.children.children.children,children.children.children.success_message'.split(',')
    let LIMITS=lodash('limit=1&limit.children.children.badges=30&limit.children.children.children=30&limit.children.children=30&limit.codes=30&limit.badges=30&limit.children.badges=30&limit.children=30&limit.children.children.badges=30&limit.children.children.children.badges=30&limit.children.children.children.children=30&limit.children.children.children=30&limit.children=30&limit.children.children=30&sort.creation_date=desc')
      .split('&').map(v => v.split('=')).fromPairs().value()
    console.time('Loading')
    const programs=await loadFromDb({model: 'program', fields: FIELDS, params: LIMITS, user: builder})
    console.timeEnd('Loading')
    console.log(ChainCache.getStats())
    console.log(ATTRIBUTES_CACHE.getStats())
  })


})
