const AppointmentType = require('../../server/models/AppointmentType')
const moment=require('moment')
const mongoose = require('mongoose')
const { performance } = require('perf_hooks');
const {forceDataModelSmartdiet, buildAttributesException}=require('../utils')

forceDataModelSmartdiet()

require('../../server/plugins/smartdiet/functions')

const {getDataModel} = require('../../config/config')
const {MONGOOSE_OPTIONS, loadFromDb, buildPopulates} = require('../../server/utils/database')
const {ROLE_CUSTOMER, COMPANY_ACTIVITY, ROLE_EXTERNAL_DIET} = require('../../server/plugins/smartdiet/consts')

const Appointment=require('../../server/models/Appointment')
const Coaching=require('../../server/models/Coaching')
const User=require('../../server/models/User')
const Company=require('../../server/models/Company')
const { computeStatistics } = require('../../server/plugins/smartdiet/functions')
require('../../server/models/Target')
require('../../server/models/Quizz')
require('../../server/models/Association')
require('../../server/models/Key')
require('../../server/models/Category')
require('../../server/models/Question')
require('../../server/models/UserQuizz')
require('../../server/models/Item')
require('../../server/models/LogbookDay')
require('../../server/models/Job')
require('../../server/models/DeclineReason')
require('../../server/models/JoinReason')
require('../../server/models/ChartPoint')

jest.setTimeout(100000)

const FIELDS=`groups_count,messages_count,users_count,user_women_count,webinars_count,webinars_replayed_count,average_webinar_registar,company,started_coachings,users_men_count,users_no_gender_count,leads_count`.split(',')
const COMPANY_CRITERION = {name: /etude clinique/i}
const DIET_CRITERION={email: 'annelaure.meunier75@gmail.com', role: ROLE_EXTERNAL_DIET}
const USER_CRITERION={email: 'hello+user@wappizy.com', role: ROLE_CUSTOMER}

describe('Performance ', () => {

  beforeAll(async() => {
    await mongoose.connect(`mongodb://localhost/smartdiet`, MONGOOSE_OPTIONS)
  })

  afterAll(async() => {
    await mongoose.connection.close()
  })

  it(`must load statistics 'fastly'`, async() => {
    const company=await Company.findOne(COMPANY_CRITERION)
    const stats=await computeStatistics({id: company._id, fields: FIELDS})
    expect(stats).toBeTruthy()
  }, 1000)

  it(`must load statistics properly`, async() => {
    const company=await Company.findOne(COMPANY_CRITERION)
    const stats=await computeStatistics({id: company._id, fields: FIELDS})
    FIELDS.forEach(f => expect(stats).not.toBeNull())
    FIELDS.forEach(f => expect(stats[f]).not.toBeUndefined())
  }, 1000)

  it('must return diet patients', async () => {
    const dietUser=await User.findOne(DIET_CRITERION)
    const [loaded]=await loadFromDb({model: 'user', id: dietUser._id, fields:['diet_patients_count'], user: dietUser})
    expect(loaded.diet_patients_count).toBeGreaterThan(0)
  }, 2000)

  it('must return diet appointments', async () => {
    const dietUser=await User.findOne(DIET_CRITERION)
    const [diet]=await loadFromDb({model: 'user', id: dietUser._id, fields: ['diet_appointments'], user: dietUser})
    expect(diet.diet_appointments?.length).toBeGreaterThan(0)
  }, 1000)

  it('must load limits', async () => {
    const LIMIT=200
    const user=await User.findOne({role: ROLE_EXTERNAL_DIET})
    const users=await loadFromDb({model: 'user', fields:['firstname'], params:{limit:LIMIT}, user})
    return expect(users.length).toEqual(LIMIT+1)
  })

  it('must speed up patients loading', async () => {
    const user=await User.findOne(DIET_CRITERION)
    const fields=`diet_patients,diet_patients.fullname,diet_patients.picture,diet_patients.company.name`.split(',')
    const [loggedUser]=await loadFromDb({model: 'loggedUser', fields, user})
    expect(loggedUser.diet_patients.length).toEqual(29)
    expect(loggedUser.diet_patients.every(p => p.company?.name)).toBeTruthy()
  }, 2000)

  it('must speed up diet appointments loading', async () => {
    const user=await User.findOne(DIET_CRITERION)
    const fields=`diet_appointments_count,diet_current_future_appointments.coaching.user.picture,diet_current_future_appointments.coaching.user.fullname,diet_current_future_appointments.coaching.user.company_name,diet_current_future_appointments.start_date,diet_current_future_appointments.end_date,diet_current_future_appointments.order,diet_current_future_appointments.appointment_type.title,diet_current_future_appointments.status,diet_current_future_appointments.visio_url,diet_current_future_appointments.coaching.user,diet_current_future_appointments,diet_current_future_appointments.coaching.user.phone`.split(',')
    const params={'limit':30}
    console.time('Loading current & future appointments')
    const [loggedUser]=await loadFromDb({model: 'loggedUser', fields, params, user})
    console.timeEnd('Loading current & future appointments')
    expect(loggedUser.diet_appointments_count).toEqual(28)
    console.log(loggedUser.diet_current_future_appointments?.length)
  }, 3000)

  it('must speed up diet patients and appointments loading', async () => {
    const user=await User.findOne(DIET_CRITERION)
    const fields=`diet_patients,diet_patients.fullname,diet_patients.picture,diet_patients.company.name,firstname,picture,diet_appointments_count,diet_patients_count,diet_current_future_appointments.coaching.user.picture,diet_current_future_appointments.coaching.user.fullname,diet_current_future_appointments.coaching.user.company_name,diet_current_future_appointments.start_date,diet_current_future_appointments.end_date,diet_current_future_appointments.order,diet_current_future_appointments.appointment_type.title,diet_current_future_appointments.status,diet_current_future_appointments.visio_url,diet_current_future_appointments.coaching.user,diet_current_future_appointments,diet_current_future_appointments.coaching.user.phone`.split(',')
    const params={'limit.diet_patients': '4', 'limit':30, 'limit.diet_current_future_appointments':'30'}
    const loggedUser=await loadFromDb({model: 'loggedUser', fields, params, user})
  }, 2000)

  it('must load appointments order', async () => {
    const user=await User.findOne(DIET_CRITERION)
    const fields=`diet_appointments.order,diet_appointments.start_date`.split(',')
    const [loadedUser]=await loadFromDb({
      model: 'loggedUser', 
      fields, 
      user, 
      params:{"limit.diet_appointments":"1","limit":"30"}})
    expect(loadedUser.diet_appointments[0].order).toBeGreaterThan(0)
  }, 3000)

  it('must load survey progress', async () => {
    const user=await User.findOne({email: /hello\+user@/})
    const fields=`name,user_surveys_progress,user_surveys_progress.value_1,picture`.split(',')
    const keys= await loadFromDb({model: 'key', fields, user})
    keys.every(k => expect(k.user_surveys_progress).toHaveLength(6))
  })

  it('must load user contents', async () => {
    const user=await User.findOne(USER_CRITERION)
    const fields=`contents,email`.split(',')
    const loggedUser= await loadFromDb({model: 'user', id:user._id, fields, user})
    expect(loggedUser.contents?.length).toBeGreaterThan(0)
  })

  it('must load all users fullname', async () => {
    const user=await User.findOne({email: /hello\+user@/})
    const fields=`fullname,company.name`.split(',')
    console.time('Loading users')
    const users= await loadFromDb({model: 'user', fields, user, params:{limit:1000}})
    console.timeEnd('Loading users')
    console.log(users.length)
    expect(users.length).toBeGreaterThan(0)
  })

})

