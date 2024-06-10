const mongoose = require('mongoose')
const { computeStatistics, preProcessGetNEVERUSE, preProcessGet, preProcessGetFORBIDDEN } = require('../../server/plugins/smartdiet/functions')
const { MONGOOSE_OPTIONS } = require('../../server/utils/database')
const User = require('../../server/models/User')
require('../../server/models/FoodDocument')
const moment = require('moment')
const { ROLE_SUPER_ADMIN, ROLE_EXTERNAL_DIET, ROLE_ADMIN } = require('../../server/plugins/smartdiet/consts')
const { stats } = require('../../server/plugins/smartdiet/kpi')
const Appointment = require('../../server/models/Appointment')
jest.setTimeout(30000000)

beforeAll(async () => {
  await mongoose.connect(`mongodb://localhost/smartdiet`, MONGOOSE_OPTIONS)
})

afterAll(async () => {
  await mongoose.connection.close()
})

describe('Statistics', () => {

  it('must return coachings_stats', async () => {
    const start_date = new Date('2020-01-05T13:00:00.000Z')
    const end_date = new Date('2021-01-05T13:00:00.000Z')
    const id = '65f2f95bd449f912a30afe74'
    const diet = '65f2faa6234cec144a11fb3f'
    const stats = await computeStatistics({ fields: ['coachings_stats']})
    expect(stats.coachings_stats).toBeTruthy()
  })
  it('must return ratio_appointments_coaching', async () => {
    const stats = await computeStatistics({fields:['ratio_appointments_coaching']})
    expect(stats.ratio_appointments_coaching).toBeGreaterThanOrEqual(0)
  })
  it('must return jobs_details, jobs_total', async () => {
    const start_date = new Date('2020-01-05T13:00:00.000Z')
    const end_date = new Date('2021-01-05T13:00:00.000Z')
    const id = '65f2f95bd449f912a30afe74'
    const diet = '65f2faa6234cec144a11fb3f'
    const stats = await computeStatistics({ fields: ['jobs_details', 'jobs_total']})

    expect(stats['jobs_total']).toBeGreaterThanOrEqual(0)
    expect(stats['jobs_details']).toBeTruthy()
  })

  it('must return join_reasons_details, join_reasons_total', async () => {
    const start_date = new Date('2020-01-05T13:00:00.000Z')
    const end_date = new Date('2021-01-05T13:00:00.000Z')
    const id = '65f2f95bd449f912a30afe74'
    const diet = '65f2faa6234cec144a11fb3f'
    const stats = await computeStatistics({ fields: ['join_reasons_details', 'join_reasons_total']})
    expect(stats['join_reasons_total']).toBeGreaterThanOrEqual(0)
    expect(stats['join_reasons_details']).not.toBeNull()
  })

  it('must return decline_reasons_details, decline_reasons_total', async () => {
    const start_date = new Date('2020-01-05T13:00:00.000Z')
    const end_date = new Date('2021-01-05T13:00:00.000Z')
    const id = '65f2f95bd449f912a30afe74'
    const diet = '65f2faa6234cec144a11fb3f'
    const stats = await computeStatistics({ fields: ['decline_reasons_details', 'decline_reasons_total']})
    expect(stats['decline_reasons_details']).toBeTruthy()
    expect(stats['decline_reasons_total']).toBeGreaterThanOrEqual(0)
  })

  it('must return ratio_stopped_started', async () => {
    const start_date = new Date('2020-01-05T13:00:00.000Z')
    const end_date = new Date('2021-01-05T13:00:00.000Z')
    const id = '65f2f95bd449f912a30afe74'
    const diet = '65f2faa6234cec144a11fb3f'
    const stats = await computeStatistics({ fields: ['ratio_stopped_started']})

    expect(stats['ratio_stopped_started']).toBeGreaterThanOrEqual(0)
  })

  it('must return ratio_dropped_started', async () => {
    const start_date = new Date('2020-01-05T13:00:00.000Z')
    const end_date = new Date('2021-01-05T13:00:00.000Z')
    const id = '65f2f95bd449f912a30afe74'
    const diet = '65f2faa6234cec144a11fb3f'
    const stats = await computeStatistics({ fields: ['ratio_dropped_started']})

    expect(stats['ratio_dropped_started']).toBeGreaterThanOrEqual(0)
  })

  it('must return leads_by_campain', async () => {
    const start_date = new Date('2020-01-05T13:00:00.000Z')
    const end_date = new Date('2021-01-05T13:00:00.000Z')
    const id = '65f2f95bd449f912a30afe74'
    const diet = '65f2faa6234cec144a11fb3f'
    const stats = await computeStatistics({ fields: ['leads_by_campain']})

    expect(stats['leads_by_campain']).toBeTruthy()
  })

  it('must return webinars_by_company_details, webinars_by_company_total', async () => {
    const start_date = new Date('2020-01-05T13:00:00.000Z')
    const end_date = new Date('2021-01-05T13:00:00.000Z')
    const id = '65f2f95bd449f912a30afe74'
    const diet = '65f2faa6234cec144a11fb3f'
    const stats = await computeStatistics({ fields: ['webinars_by_company_details', 'webinars_by_company_total']})

    expect(stats['webinars_by_company_details']).toBeTruthy()
    expect(stats['webinars_by_company_total']).toBeGreaterThanOrEqual(0)
  })

  it('must return calls_stats', async () => {
    const operatorId = "65fc021f93262d3cef08bf35"
    const stats = await computeStatistics({ fields: ['calls_stats'] })
    console.log(stats.calls_stats)
    expect(stats['calls_stats']).toBeTruthy()
  })
  const computeMeanDuration = (measures) => {
    const grouped = measures.reduce((acc, { label, duration }) => {
      if (!acc[label]) acc[label] = []
      acc[label].push(duration)
      return acc
    }, {})
  
    const means = Object.keys(grouped).map(label => {
      const durations = grouped[label]
      const mean = durations.reduce((sum, value) => sum + value, 0) / durations.length
      return { label, mean }
    })
  
    return means
  }
  
  it.only('must compute all stats for kpi coaching page with filters', async () => {
    const start_date = new Date('2020-01-05T13:00:00.000Z')
    const end_date = new Date('2021-01-05T13:00:00.000Z')
    const company = '65f2f95bd449f912a30afe74'
    const diet = '65f2faa6234cec144a11fb3f'
  
    const fields = [
      // 'coachings_started',
      // 'coachings_ongoing',
      // 'coachings_stopped',
      // 'coachings_dropped',
      // 'coachings_finished',
      // 'coachings_renewed',
      // 'nut_advices',
      // 'ratio_dropped_started',
      // 'ratio_stopped_started',
      // 'ratio_appointments_coachings',
      // 'coachings_gender_female',
      // 'coachings_gender_male',
      // 'coachings_gender_non_binary',
      // 'coachings_gender_unknown',
      'coachings_stats',
    ]
  
    const combinations = [
      { label: 'noParams', filters: {} },
      // { label: 'diet', filters: { diet } },
      // { label: 'start_date', filters: { start_date } },
      // { label: 'end_date', filters: { end_date } },
      // { label: 'company', filters: { company } },
      // { label: 'all but company', filters: { diet, start_date, end_date } },
      // { label: 'all', filters: { company, start_date, end_date, diet } },
    ]
  
    let allMeasures = []
  
    const runTest = async () => {
      let measures = []
  
      const measure = (label, duration) => {
        measures.push({ label, duration })
      }
  
      for (let combination of combinations) {
        let now = moment()
        for (let field of fields) {
          const noww = moment()
          const stats = await computeStatistics({ fields: [field], ...combination.filters })
          measure(combination.label + ' ' + field, moment().diff(noww, 'milliseconds'))
          console.log(combination, "*********************************************************")
          stats.coachings_stats.forEach(stat => {
            console.table({total : stat.total, name:stat.name})
            console.table(stat.appointments)
            console.table(stat.appointments[0].ranges)
          })
        }
        measure(combination.label, moment().diff(now, 'milliseconds'))
      }
  
      let now = moment()
      const res = await computeStatistics({ fields, company, start_date, end_date, diet })
      console.table(res)
      return measures
    }
  
    // for (let i = 0; i < 5; i++) {
      const measures = await runTest()
      allMeasures = allMeasures.concat(measures)
    // }
  
    const meanDurations = computeMeanDuration(allMeasures)
  
    console.table(meanDurations)
  })
  
  
  it('must get filters and treat them properly', async() => {
    console.log('****************************************ADMIN****************************************')
    const userAdmin = await User.findOne({role: ROLE_ADMIN})
    // const userDiet = await User.findOne({role: ROLE_EXTERNAL_DIET})
    let user
    let diet
    let id
    const timings = {}
    //first test, no filters, user is Admin
    const params = []
    params['limit'] = 30
    const fields=[]
    // user = userAdmin
    const model='billing'
    
    // let now = moment()
    // const result = await preProcessGetFORBIDDEN({ model, id, fields, user, params })  
    // console.log(result)
    // timings.admin=moment().diff(now, 'milliseconds')
    // const totalAdmin = result.data.total

    // //Second test, no filters, user is Admin, has id
    // console.log('****************************************ADMIN WITH ID****************************************')
    // now = moment()
    // diet = userDiet
    // id = diet._id
    // const idResult = await preProcessGetFORBIDDEN({ model, id, fields, user, params })  
    // console.log(idResult)
    // timings.admingWithDiet=moment().diff(now, 'milliseconds')
    // const totalAdminDiet = idResult.data[0].total
  
    // //Third test, no filters, user is Diet
    // console.log('****************************************DIET****************************************')
    // now=moment()
    // user = diet
    // const dietResult = await preProcessGetFORBIDDEN({model, id, fields, user, params})
    // console.log(dietResult)
    // timings.diet=moment().diff(now, 'milliseconds')
    // const totalDiet = dietResult.data.length

    // //Fourth test, date filters, user is Admin 
    // console.log('****************************************ADMIN WITH DATE FILTERS****************************************')
    // now=moment()
    // params['filter.start_date'] = '2023-01-05T13:00:00.000Z',
    // params['filter.end_date'] = '2024-01-05T13:00:00.000Z'
    // user = userAdmin
    // const filteredResult = await preProcessGetFORBIDDEN({ model, fields, user, params })  
    // console.log(filteredResult)
    // timings.adminDateFilter=moment().diff(now, 'milliseconds')
    // const totalAdminDate = filteredResult.data.total

    // //Fifth test, date filters, user is Diet
    // console.log('****************************************DIET WITH DATE FILTERS****************************************')
    // now=moment()
    // user = userDiet
    // const filteredDietResult = await preProcessGetFORBIDDEN({model, id, fields, user, params})
    // console.log(filteredDietResult)
    // timings.dietDateFilter=moment().diff(now, 'milliseconds')
    // const totalDietDate = filteredDietResult.data.length

    //Sixth test, admin with company
    params['filter.company'] = '64a6916f9abb3d5904c60799'
    params['filter.start_date'] = ''
    params['filter.end_date'] = ''
    user= userAdmin
    now = moment()
    const companyFilter = await preProcessGetFORBIDDEN({ model, fields, user, params })  
    console.log(companyFilter)
    timings.companyFilter = moment().diff(now, 'milliseconds')
    const totalCompany = companyFilter.data.length
  
    console.table(timings)
    // expect(totalAdmin).toBeGreaterThanOrEqual(0)
    // expect(totalAdminDiet).toBeLessThanOrEqual(totalAdmin)
    // expect(totalAdminDate).toBeLessThanOrEqual(totalAdmin)
    // expect(totalDiet).toBeGreaterThanOrEqual(0)
    // expect(totalDietDate).toBeGreaterThanOrEqual(0)
    expect(totalCompany).toBeGreaterThanOrEqual(0)
  })
  it('returns diet stats', async() => {
    const fields = [
      'diet_coaching_enabled',
      'diet_site_enabled',
      'diet_visio_enabled',
      'diet_recruiting',
      'diet_refused',
      'diet_activated',
    ]
    const stats = await computeStatistics({fields})
    console.log(stats)
    expect(stats.diet_coaching_enabled).toBeGreaterThanOrEqual(0)
    expect(stats.diet_site_enabled).toBeGreaterThanOrEqual(0)
    expect(stats.diet_visio_enabled).toBeGreaterThanOrEqual(0)
    expect(stats.diet_recruiting).toBeGreaterThanOrEqual(0)
    expect(stats.diet_refused).toBeGreaterThanOrEqual(0)
    expect(stats.diet_activated).toBeGreaterThanOrEqual(0)
  })
  it('returns ratio appointments coachings', async () => {
    const start_date = new Date('2020-01-05T13:00:00.000Z')
    const end_date = new Date('2021-01-05T13:00:00.000Z')
    const company = '65f2f95bd449f912a30afe74'
    const diet = '65f2faa6234cec144a11fb3f'
    const stats = await computeStatistics({fields:['ratio_appointments_coaching'], diet})
    console.log(stats)
  })
})
