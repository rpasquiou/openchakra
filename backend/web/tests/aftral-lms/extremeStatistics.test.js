const mongoose = require('mongoose')
const { MONGOOSE_OPTIONS, loadFromDb } = require('../../server/utils/database')
const User = require('../../server/models/User')
require('../../server/models/Statistics')
require('../../server/plugins/aftral-lms/functions')

jest.setTimeout(30000000)

describe('XT Statistics', () => {

  // OK formateur statis group rapport co https://localhost:4201/myAlfred/api/studio/statistics/67055ece0d57fc0f914a2c90/?fields=sessions.trainees.statistics.spent_time_str,sessions.trainees.email,sessions.trainees.statistics.resources_progress,sessions.trainees.plain_password,sessions.trainees,sessions,sessions.trainees.firstname,sessions.trainees.lastname,sessions.trainees.statistics.certificate,sessions.code,picture&limit.sessions.trainees=30&limit=30&limit.sessions=30&limit.sessions=30&limit=30&limit=30&limit=30&sort.sessions.trainees.lastname=asc&
  // KO formateur statis group devoir https://localhost:4201/myAlfred/api/studio/statistics/67055ece0d57fc0f914a2c90/?fields=sessions,sessions.code,sessions.evaluation_resources.name,sessions.evaluation_resources.correction,sessions.evaluation_resources.code,sessions.evaluation_resources.max_attempts,sessions.evaluation_resources,sessions.evaluation_resources.success_note_max,sessions.evaluation_resources.resource_type,sessions.evaluation_resources.success_note_min,sessions.evaluation_resources.homework_limit_date,sessions.evaluation_resources.homeworks_submitted_count,sessions.evaluation_resources.session.trainees_count,sessions.evaluation_resources.homeworks.trainee.fullname,sessions.evaluation_resources.homeworks,sessions.evaluation_resources.homeworks.trainee.picture,sessions.evaluation_resources.homeworks.creation_date,sessions.evaluation_resources.success_scale&limit.sessions=30&limit=30&limit=30&limit=30&limit.sessions.evaluation_resources=30&limit.sessions.evaluation_resources.homeworks=30&limit.sessions=30&sort.sessions.evaluation_resources.homeworks.creation_date=asc&
  // OK formateur statis session rapport https://localhost:4201/myAlfred/api/studio/statistics/66fc029c3de03e61e085764c/?fields=sessions.name,sessions.code,sessions,picture,sessions.trainees.statistics.spent_time_str,sessions.trainees.email,sessions.trainees.statistics.resources_progress,sessions.trainees.plain_password,sessions.trainees,sessions.trainees.firstname,sessions.trainees.lastname,sessions.trainees.statistics.certificate&limit=30&limit.sessions=30&limit=30&limit.sessions.trainees=30&limit=30&limit.sessions=30&limit=30&limit.sessions=30&sort.sessions.trainees.lastname=asc&
  // OK formateur statis session devoirs https://localhost:4201/myAlfred/api/studio/session/66fc029c3de03e61e085764c/?fields=name,code,evaluation_resources.name,evaluation_resources.correction,evaluation_resources.code,evaluation_resources.max_attempts,evaluation_resources,evaluation_resources.success_note_max,evaluation_resources.resource_type,evaluation_resources.success_note_min,evaluation_resources.homework_limit_date,evaluation_resources.homeworks_submitted_count,evaluation_resources.session.trainees_count,evaluation_resources.homeworks.trainee.fullname,evaluation_resources.homeworks,evaluation_resources.homeworks.trainee.picture,evaluation_resources.homeworks.creation_date,evaluation_resources.success_scale,evaluation_resources.homeworks_missing_count&limit=30&limit.evaluation_resources=30&limit.evaluation_resources.homeworks=30&limit=30&limit=30&sort.evaluation_resources.homeworks.creation_date=asc&
  
  // OK apprenant statis notes https://localhost:4201/myAlfred/api/studio/session/66fc029c3de03e61e085764c/?fields=evaluation_resources.name,evaluation_resources.note_str,evaluation_resources.homeworks.description,evaluation_resources.homeworks,evaluation_resources.homeworks.document,evaluation_resources.resource_type,evaluation_resources,evaluation_resources.correction,code,children.name,start_date,end_date,location,obtained_badges,obtained_badges.picture,children,spent_time_str,session_product_code,resources_progress,evaluation_resources.note,evaluation_resources.homework_limit_date&limit.evaluation_resources.homeworks=30&limit.evaluation_resources.homeworks=30&limit.evaluation_resources=30&limit=30&limit.obtained_badges=30&limit.children=30&limit=30&limit=30&limit=30&limit.evaluation_resources.homeworks=30&&

  const trainerReportUrlKo=`https://localhost:4201/myAlfred/api/studio/statistics/67055ece0d57fc0f914a2c90/?fields=sessions,sessions.code,sessions.evaluation_resources.name,sessions.evaluation_resources.correction,sessions.evaluation_resources.code,sessions.evaluation_resources.max_attempts,sessions.evaluation_resources,sessions.evaluation_resources.success_note_max,sessions.evaluation_resources.resource_type,sessions.evaluation_resources.success_note_min,sessions.evaluation_resources.homework_limit_date,sessions.evaluation_resources.homeworks_submitted_count,sessions.evaluation_resources.session.trainees_count,sessions.evaluation_resources.homeworks.trainee.fullname,sessions.evaluation_resources.homeworks,sessions.evaluation_resources.homeworks.trainee.picture,sessions.evaluation_resources.homeworks.creation_date,sessions.evaluation_resources.success_scale&limit.sessions=30&limit=30&limit=30&limit=30&limit.sessions.evaluation_resources=30&limit.sessions.evaluation_resources.homeworks=30&limit.sessions=30&sort.sessions.evaluation_resources.homeworks.creation_date=asc`
  const trainerDevoirOk=`https://localhost:4201/myAlfred/api/studio/statistics/67055ece0d57fc0f914a2c90/?fields=sessions,sessions.code,sessions.evaluation_resources.name,sessions.evaluation_resources.correction,sessions.evaluation_resources.code,sessions.evaluation_resources.max_attempts,sessions.evaluation_resources,sessions.evaluation_resources.success_note_max,sessions.evaluation_resources.resource_type,sessions.evaluation_resources.success_note_min,sessions.evaluation_resources.homework_limit_date,sessions.evaluation_resources.homeworks_submitted_count,sessions.evaluation_resources.session.trainees_count,sessions.evaluation_resources.homeworks.trainee.fullname,sessions.evaluation_resources.homeworks,sessions.evaluation_resources.homeworks.trainee.picture,sessions.evaluation_resources.homeworks.creation_date,sessions.evaluation_resources.success_scale&limit.sessions=30&limit=30&limit=30&limit=30&limit.sessions.evaluation_resources=30&limit.sessions.evaluation_resources.homeworks=30&limit.sessions=30&sort.sessions.evaluation_resources.homeworks.creation_date=asc&`

  let trainer
  let trainee

  const splitUrl = url => {
    let id, fields, params, rest
    url=url.replace('https://localhost:4201/myAlfred/api/studio/statistics/', '')
    id=url.split('/')[0]
    url=url.replace(/^.*\?fields=/, '')
    fields=url.split('&')[0].split(',')
    return [id, fields]
  }

  beforeAll(async () => {
    await mongoose.connect(`mongodb://localhost/aftral-lms`, MONGOOSE_OPTIONS)
    trainer=await User.findOne({email: /hello\+formateur/})
    trainee=await User.findOne({email: /hello\+apprenant/})
  })
  
  afterAll(async () => {
    await mongoose.connection.close()
  })

  it.only('Must load trainee group report', async () => {
    const [id, fields]=splitUrl(trainerReportUrlKo)
    const [result]=await loadFromDb({model: 'statistics', id, fields, user:trainer})
    console.log('result', result.sessions.map(s => s.evaluation_resources))
  })

  it('Must load trainee group devoir', async () => {
    const [id, fields]=splitUrl(trainerDevoirOk)
    const [result]=await loadFromDb({model: 'statistics', id, fields, user:trainer})
    console.log('result', result.sessions.map(s => s.evaluation_resources))
  })

    
})
