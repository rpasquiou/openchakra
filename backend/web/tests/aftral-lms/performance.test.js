const mongoose = require('mongoose')
const fs = require('fs')
const lodash=require('lodash')
const { ROLE_CONCEPTEUR} = require('../../server/plugins/aftral-lms/consts')
const {MONGOOSE_OPTIONS, loadFromDb} = require('../../server/utils/database')
const { getDatabaseUri } = require('../../config/config')
const { runPromisesWithDelay } = require('../../server/utils/concurrency')
require('../../server/plugins/aftral-lms/functions')
const User=require('../../server/models/User')
require('../../server/models/Certification')
require('../../server/models/PermissionGroup')
require('../../server/models/Feed')
require('../../server/models/Badge')


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
    let LIMITS=lodash('limit=2&limit.children.children.badges=30&limit.children.children.children=30&limit.children.children=30&limit.codes=30&limit.badges=30&limit.children.badges=30&limit.children=30&limit.children.children.badges=30&limit.children.children.children.badges=30&limit.children.children.children.children=30&limit.children.children.children=30&limit.children=30&limit.children.children=30&sort.creation_date=desc')
      .split('&').map(v => v.split('=')).fromPairs().value()
    await runPromisesWithDelay(lodash.range(10).map(() => async () => {
      console.time('Loading')
      const programs=await loadFromDb({model: 'program', fields: FIELDS, params: LIMITS, user: builder})
      console.timeEnd('Loading')
    }))
  })

  it.only('must load session', async() => {
    const trainee=await User.findOne({email: 'hello+apprenant@wappizy.com'})
    expect(trainee).toBeTruthy()
    const ID='66b0f1cc3356935c1fdaa148'
    const model='session'
    const FIELDS='children.children.name,children.children.children.children.parent.parent.parent.name,children.children.children.children.parent.parent.name,children.children.children.children.parent.name,children.children.children.children.resource_type,children.children.children.children.name,children.children.children.children.annotation,children.children.children.children,children.children.children,children.children,children,children.children.children.children.children.parent.parent.parent.name,children.children.children.children.children.parent.parent.name,children.children.children.children.children.parent.name,children.children.children.children.children.resource_type,children.children.children.children.children.name,children.children.children.children.children.annotation,children.children.children.children.children,children.children.obtained_badges.picture,children.children.obtained_badges,children.children.achievement_status,children.children.resources_progress,code,children.name,children.description,start_date,end_date,location,trainers,trainers.fullname,trainers.email,trainers.picture,children.children.homeworks.note,children.children.homeworks.scale,children.children.homeworks,children.children.children.name,children.children.children.children.homeworks.description,children.children.children.children.homeworks,children.children.children.children.evaluation,children.children.type,spent_time_str,children.children.children.description,children.children.children.success_message,children.children.children.children.code,children.children.children.children.optional,children.children.children.children.success_message,children.children.children.children.spent_time_str,children.children.children.children.masked,children.children.children.children.achievement_status,children.children.children.children.homeworks.note,children.children.children.children.success_note_max,children.children.children.children.homeworks.document,children.codes.code,children.children.children.children.disliked,children.children.children.children.liked,children.codes,children.children.children.children.access_condition,children.children.closed,children.children.children.children.homeworks.correction,children.children.children.children.children.success_note_max,children.children.children.children.children.homeworks.description,children.children.children.children.children.homeworks,children.children.children.children.children.homeworks.document,children.children.children.children.children.homeworks.correction,children.closed,children.children.children.picture,children.children.children.type,children.children.children.closed,children.children.children.spent_time_str,children.children.children.achievement_status,children.children.children.children.type,children.children.children.children.obtained_badges.picture,children.children.children.children.obtained_badges,children.children.order,children.children.children.order,children.children.children.children.order,children.children.children.resources_progress,resources_progress,children.children.finished_resources_count,children.children.resources_count,children.children.children.finished_resources_count,children.children.children.resources_count,children.children.children.children.resources_progress,children.children.children.children.closed,children.children.children.children.description,children.children.children.children.finished_resources_count,children.children.children.children.resources_count,children.children.children.children.children.code,children.children.children.children.children.spent_time_str,children.children.children.children.children.masked,children.children.children.children.children.evaluation,children.children.children.children.children.disliked,children.children.children.children.children.liked,children.children.children.children.children.access_condition,children.children.children.children.children.type,children.children.children.children.children.achievement_status,children.children.children.children.children.optional,children.children.spent_time_str'.split(',')
    let LIMITS=lodash('limit.children.children.children.children.children.homeworks=30&limit.children.children.children.children.children.homeworks=30&limit.children.children.children.children.children.homeworks=30&limit.children.children.children.children.children=30&limit.children.children.children.children.children=30&limit.children.children.children.children.children=30&limit.children.children.children.children.homeworks=30&limit.children.children.children.children.homeworks=30&limit.children.children.children.children.homeworks=30&limit.children.children.children.children.homeworks=30&limit.children.children.children.children.homeworks=30&limit.children.children.children.children.obtained_badges=30&limit.children.children.children.children=30&limit.children.children.children.children=30&limit.children.children.children.children=30&limit.children.children.children.children=30&limit.children.children.children.children=30&limit.children.children.children=30&limit.children.children.children=30&limit.children.children.children=30&limit.children.children.children=30&limit.children.children.children=30&limit.children.children.homeworks=30&limit.children.children.obtained_badges=30&limit.children.children=1000&limit.children.children=30&limit.children.children=30&limit.children.children=30&limit.children.codes=30&limit.children=1000&limit.children=30&limit.children=30&limit.children=30&limit.children=30&limit.children=30&limit.children=30&limit.trainers=30&limit=30&limit=30&limit=30&limit=30&limit=30&limit=30')
      .split('&').map(v => v.split('=')).fromPairs().value()
    console.time('Loading full session')
    const [session]=await loadFromDb({model, id: ID, fields:FIELDS, params: LIMITS, user: trainee})
    console.timeEnd('Loading full session')
    const getAllProgress = block => {
      return [block.resources_progress, block.children?.map(c => getAllProgress(c))]
    }
    console.log(lodash(getAllProgress(session)).flattenDeep().uniq().value())
    const received=JSON.stringify(session, null, 2)
    const expected=fs.readFileSync('/tmp/all').toString()
    expect(received).toEqual(expected)
  })


})
