const mongoose = require('mongoose')
const { computeStatistics } = require('../../server/plugins/smartdiet/functions')
const { MONGOOSE_OPTIONS } = require('../../server/utils/database')
const { ROLE_ADMIN } = require('../../server/plugins/smartdiet/consts')
const User = require('../../server/models/User')
require('../../server/models/FoodDocument')

jest.setTimeout(300000)

beforeAll(async () => {
  await mongoose.connect(`mongodb://localhost/smartdiet`, MONGOOSE_OPTIONS)
})

afterAll(async () => {
  await mongoose.connection.close()
})

describe('Statistics', () => {
  it('must return coachings_started', async () => {
    const startDate = new Date('2020-01-05T13:00:00.000Z')
    const id = '65f2f95bd449f912a30afe74'
    const endDate = new Date('2021-01-05T13:00:00.000Z')
    const diet = '65f2faa6234cec144a11fb3f'
    const stats = await computeStatistics({ fields: [`coachings_started`] })
    console.table(stats)
    
    expect(stats.coachings_started).toBeGreaterThanOrEqual(0)
  })

  it('must return coachings_stopped', async () => {
    const startDate = new Date('2020-01-05T13:00:00.000Z')
    const id = '65f2f95bd449f912a30afe74'
    const endDate = new Date('2021-01-05T13:00:00.000Z')
    const diet = '65f2faa6234cec144a11fb3f'
    const stats = await computeStatistics({ fields: [`coachings_stopped`] })
    console.table(stats)
    
    expect(stats.coachings_stopped).toBeGreaterThanOrEqual(0)
  })
  it('must return ratio appointments on coachings',async()=>{
    const stats = await computeStatistics({fields:['ratio_appointments_coaching']})
    console.table(stats)
    expect(stats.ratio_appointments_coaching).toBeGreaterThanOrEqual(0)
  })
  it('must return coachings_dropped', async () => {
    const stats = await computeStatistics({ fields: [`coachings_dropped`] })
    console.table(stats)
    expect(stats.coachings_dropped).toBeGreaterThanOrEqual(0)
  })

  it('must return coachings_ongoing', async () => {
    const stats = await computeStatistics({ fields: [`coachings_ongoing`] })
    console.table(stats)
    expect(stats.coachings_ongoing).toBeGreaterThanOrEqual(0)
  })
  it('must return coachings_finished', async () => {
    const stats = await computeStatistics({ fields: [`coachings_finished`] })
    console.table(stats)
    expect(stats.coachings_finished).toBeGreaterThanOrEqual(0)
  })  
  it('must return coachings_stats', async () => {
    const date = new Date('2024-01-05T13:00:00.000Z')
    const id = '651a9d3e1a7bd51b71a40327'
    const stats = await computeStatistics({ fields: ['coachings_stats']})
    for(let stat of stats.coachings_stats){
      console.table({name:stat.name,total : stat.total})
      console.log(stat.ranges)
      for(let app of stat.appointments) {
        console.table({order:app.order, total:app.total})
        console.log(app.ranges)
        console.log('------------------------------------------------------------------')
      }
      console.log("******************************************************************************************************************************")
    }
    expect(stats.coachings_stats).toBeTruthy()
  })

  it('must return coachings_gender_male', async () => {
    const stats = await computeStatistics({ fields: ['coachings_gender_male'] })
    expect(stats['coachings_gender_male']).toBeGreaterThanOrEqual(0)
  })

  it('must return coachings_gender_unknown', async () => {
    const stats = await computeStatistics({ fields: ['coachings_gender_unknown'] })
    expect(stats['coachings_gender_unknown']).toBeGreaterThanOrEqual(0)
  })

  it('must return nut_advices', async () => {
    const stats = await computeStatistics({ fields: ['nut_advices'] })
    expect(stats['nut_advices']).toBeGreaterThanOrEqual(0)
  })

  it('must return coachings_renewed', async () => {
    const stats = await computeStatistics({ fields: ['coachings_renewed'] })
    
    expect(stats['coachings_renewed']).toBeGreaterThanOrEqual(0)
  })

  it('must return jobs_details, jobs_total', async () => {
    const stats = await computeStatistics({ fields: ['jobs_details', 'jobs_total'] })
    
    expect(stats['jobs_total']).toBeGreaterThanOrEqual(0)
    expect(stats['jobs_details']).toBeTruthy()
  })

  it('must return join_reasons_details, join_reasons_total', async () => {
    const stats = await computeStatistics({ fields: ['join_reasons_details','join_reasons_total'] })
    expect(stats['join_reasons_total']).toBeGreaterThanOrEqual(0)
    expect(stats['join_reasons_details']).not.toBeNull()
  })

  it('must return decline_reasons_details, decline_reasons_total', async () => {
    const stats = await computeStatistics({ fields: ['decline_reasons_details','decline_reasons_total'] })
    expect(stats['decline_reasons_details']).toBeTruthy()
    expect(stats['decline_reasons_total']).toBeGreaterThanOrEqual(0)
  })

  it('must return ratio_stopped_started', async () => {
    const stats = await computeStatistics({ fields: ['ratio_stopped_started'] })
    
    expect(stats['ratio_stopped_started']).toBeGreaterThanOrEqual(0)
  })

  it('must return ratio_dropped_started', async () => {
    const stats = await computeStatistics({ fields: ['ratio_dropped_started'] })
    
    expect(stats['ratio_dropped_started']).toBeGreaterThanOrEqual(0)
  })

  it('must return incalls_per_operator_total, outcalls_per_operator_total, incalls_per_operator_details, outcalls_per_operator_details', async () => {
    const stats = await computeStatistics({ fields: ['incalls_per_operator_total','outcalls_per_operator_total','incalls_per_operator_details','outcalls_per_operator_details'] })
    expect(stats['incalls_per_operator_total']).toBeTruthy()
    expect(stats['outcalls_per_operator_total']).toBeTruthy()
    expect(stats['incalls_per_operator_details']).toBeTruthy()
    expect(stats['outcalls_per_operator_details']).toBeTruthy()
  })
  it('must return nut_advices_per_operator_total, coachings_per_operator_total, declined_per_operator_total, unreachables_per_operator_total, useful_contacts_per_operator_total, renewed_coachings_per_operator_total, coa_cu_transformation_per_operator_total, cn_cu_transformation_per_operator_total', async () => {
    const stats = await computeStatistics({ fields: ['nut_advices_per_operator_total','coachings_per_operator_total','declined_per_operator_total','unreachables_per_operator_total','useful_contacts_per_operator_total','renewed_coachings_per_operator_total','coa_cu_transformation_per_operator_total','cn_cu_transformation_per_operator_total'] })
    console.log(stats)
    expect(stats['nut_advices_per_operator_total']).toBeGreaterThanOrEqual(0)
    expect(stats['coachings_per_operator_total']).toBeGreaterThanOrEqual(0)
    expect(stats['declined_per_operator_total']).toBeGreaterThanOrEqual(0)
    expect(stats['unreachables_per_operator_total']).toBeGreaterThanOrEqual(0)
    expect(stats['useful_contacts_per_operator_total']).toBeGreaterThanOrEqual(0)
    expect(stats['renewed_coachings_per_operator_total']).toBeGreaterThanOrEqual(0)
    expect(stats['coa_cu_transformation_per_operator_total']).toBeGreaterThanOrEqual(0)
    expect(stats['cn_cu_transformation_per_operator_total']).toBeGreaterThanOrEqual(0)
  })
  it('must return nut_advices_per_operator_details, coachings_per_operator_details, declined_per_operator_details, unreachables_per_operator_details, useful_contacts_per_operator_details, renewed_coachings_per_operator_details, coa_cu_transformation_per_operator_details, cn_cu_transformation_per_operator_details', async () => {
    const stats = await computeStatistics({ fields: ['nut_advices_per_operator_details','coachings_per_operator_details','declined_per_operator_details','unreachables_per_operator_details','useful_contacts_per_operator_details','renewed_coachings_per_operator_details','coa_cu_transformation_per_operator_details','cn_cu_transformation_per_operator_details'] })   
    console.log(stats)
    expect(stats['nut_advices_per_operator_details']).toBeTruthy()
    expect(stats['coachings_per_operator_details']).toBeTruthy()
    expect(stats['declined_per_operator_details']).toBeTruthy()
    expect(stats['unreachables_per_operator_details']).toBeTruthy()
    expect(stats['useful_contacts_per_operator_details']).toBeTruthy()
    expect(stats['renewed_coachings_per_operator_details']).toBeTruthy()
    expect(stats['coa_cu_transformation_per_operator_details']).toBeTruthy()
    expect(stats['cn_cu_transformation_per_operator_details']).toBeTruthy()
  })
  it('must return leads_by_campain', async () => {
    const stats = await computeStatistics({ fields: ['leads_by_campain'] })
    
    expect(stats['leads_by_campain']).toBeTruthy()
  })
  it('must return webinars_by_company_details, webinars_by_company_total', async () => {
    const stats = await computeStatistics({ fields: ['webinars_by_company_details','webinars_by_company_total'] })
    

    expect(stats['webinars_by_company_details']).toBeTruthy()
    expect(stats['webinars_by_company_total']).toBeGreaterThanOrEqual(0)
  })
  it.only('must return calls_stats', async () => {
    const stats = await computeStatistics({ fields: ['calls_stats']})
    console.table(stats.calls_stats.totals)
    for(let operator of stats.calls_stats.operatorStats){
      console.log(operator)
    }
    expect(stats['calls_stats']).toBeTruthy()
  })
})

