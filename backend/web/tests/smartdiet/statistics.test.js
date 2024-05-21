const mongoose = require('mongoose')
const { computeStatistics } = require('../../server/plugins/smartdiet/functions')
const { MONGOOSE_OPTIONS } = require('../../server/utils/database')

jest.setTimeout(300000)

beforeAll(async () => {
  await mongoose.connect(`mongodb://localhost/smartdiet`, MONGOOSE_OPTIONS)
})

afterAll(async () => {
  await mongoose.connection.close()
})

describe('Statistics', () => {
  it('must return coachings_started', async () => {
    const stats = await computeStatistics({ fields: [`coachings_started`] })
    console.log('coachings_started', stats.coachings_started)
    expect(stats.coachings_started).toBeGreaterThanOrEqual(0)
  })

  it('must return coachings_stopped', async () => {
    const stats = await computeStatistics({ fields: [`coachings_stopped`] })
    console.log('coachings_stopped', stats.coachings_stopped)
    expect(stats.coachings_stopped).toBeGreaterThanOrEqual(0)
  })

  it('must return coachings_dropped', async () => {
    const stats = await computeStatistics({ fields: [`coachings_dropped`] })
    console.log('coachings_dropped', stats.coachings_dropped)
    expect(stats.coachings_dropped).toBeGreaterThanOrEqual(0)
  })

  it('must return coachings_ongoing', async () => {
    const stats = await computeStatistics({ fields: [`coachings_ongoing`] })
    console.log('coachings_ongoing', stats.coachings_ongoing)
    expect(stats.coachings_ongoing).toBeGreaterThanOrEqual(0)
  })

  it('must return cs_done', async () => {
    const stats = await computeStatistics({ fields: ['cs_done'] })
    console.log('cs_done', stats.cs_done)
    expect(stats.cs_done).toBeGreaterThanOrEqual(0)
  })

  it('must return cs_done_c1', async () => {
    const stats = await computeStatistics({ fields: ['cs_done_c1'] })
    console.log('cs_done_c1', stats['cs_done_c1'])
    expect(stats['cs_done_c1']).not.toBeNull()
  })

  it('must return cs_upcoming', async () => {
    const stats = await computeStatistics({ fields: ['cs_upcoming'] })
    console.log('cs_upcoming', stats.cs_upcoming)
    expect(stats.cs_upcoming).toBeGreaterThanOrEqual(0)
  })

  it('must return cs_upcoming_c1', async () => {
    const stats = await computeStatistics({ fields: ['cs_upcoming_c1'] })
    console.log('cs_upcoming_c1', stats['cs_upcoming_c1'])
    expect(stats['cs_upcoming_c1']).not.toBeNull()
  })

  it('must return started_coaching_no_birthday', async () => {
    const stats = await computeStatistics({ fields: ['started_coaching_no_birthday'] })
    console.log('started_coaching_no_birthday', stats['started_coaching_no_birthday'])
    expect(stats['started_coaching_no_birthday']).not.toBeNull()
  })

  it('must return started_coachings_18_24', async () => {
    const stats = await computeStatistics({ fields: ['started_coachings_18_24'] })
    console.log('started_coachings_18_24', stats['started_coachings_18_24'])
    expect(stats['started_coachings_18_24']).toBeGreaterThanOrEqual(0)
  })

  it('must return started_coachings_25_29_percent', async () => {
    const stats = await computeStatistics({ fields: ['started_coachings_25_29_percent'] })
    console.log('started_coachings_25_29_percent', stats['started_coachings_25_29_percent'])
    expect(stats['started_coachings_25_29_percent']).toBeGreaterThanOrEqual(0)
  })

  it('must return coachings_gender_male', async () => {
    const stats = await computeStatistics({ fields: ['coachings_gender_male'] })
    console.log('coachings_gender_male', stats['coachings_gender_male'])
    expect(stats['coachings_gender_male']).toBeGreaterThanOrEqual(0)
  })

  it('must return coachings_gender_unknown', async () => {
    const stats = await computeStatistics({ fields: ['coachings_gender_unknown'] })
    console.log('coachings_gender_unknown', stats['coachings_gender_unknown'])
    expect(stats['coachings_gender_unknown']).toBeGreaterThanOrEqual(0)
  })

  it('must return nut_advices', async () => {
    const stats = await computeStatistics({ fields: ['nut_advices'] })
    console.log('nut_advices', stats['nut_advices'])
    expect(stats['nut_advices']).toBeGreaterThanOrEqual(0)
  })

  it('must return coachings_renewed', async () => {
    const stats = await computeStatistics({ fields: ['nut_adcoachings_renewedvices'] })
    console.log('coachings_renewed', stats['coachings_renewed'])
    expect(stats['coachings_renewed']).toBeGreaterThanOrEqual(0)
  })

  it('must return jobs_details, jobs_total', async () => {
    const stats = await computeStatistics({ fields: ['jobs_details', 'jobs_total'] })
    console.log('jobs_details', stats['jobs_details'])
    console.log('jobs_total', stats['jobs_total'])
    expect(stats['jobs_total']).toBeGreaterThanOrEqual(0)
    expect(stats['jobs_details']).toBeTruthy()
  })

  it('must return join_reasons_details, join_reasons_total', async () => {
    const stats = await computeStatistics({ fields: ['join_reasons_details', 'join_reasons_total'] })
    console.log('join_reasons_details', stats['join_reasons_details'])
    console.log('join_reasons_total', stats['join_reasons_total'])
    expect(stats['join_reasons_total']).toBeGreaterThanOrEqual(0)
    expect(stats['join_reasons_details']).not.toBeNull()
  })

  it('must return decline_reasons_details, decline_reasons_total', async () => {
    const stats = await computeStatistics({ fields: ['decline_reasons_details', 'decline_reasons_total'] })
    console.log('decline_reasons_details', stats['decline_reasons_details'])
    console.log('decline_reasons_total', stats['decline_reasons_total'])
    expect(stats['decline_reasons_details']).toBeTruthy()
    expect(stats['decline_reasons_total']).toBeGreaterThanOrEqual(0)
  })

  it('must return ratio_stopped_started', async () => {
    const stats = await computeStatistics({ fields: ['ratio_stopped_started'] })
    console.log('ratio_stopped_started', stats['ratio_stopped_started'])
    expect(stats['ratio_stopped_started']).toBeGreaterThanOrEqual(0)
  })

  it('must return ratio_dropped_started', async () => {
    const stats = await computeStatistics({ fields: ['ratio_dropped_started'] })
    console.log('ratio_dropped_started', stats['ratio_dropped_started'])
    expect(stats['ratio_dropped_started']).toBeGreaterThanOrEqual(0)
  })

  it('must return incalls_total, outcalls_total, incalls_per_operator, outcalls_per_operator', async () => {
    const stats = await computeStatistics({ fields: ['incalls_total', 'outcalls_total', 'incalls_per_operator', 'outcalls_per_operator'] })
    console.log('incalls_total', stats['incalls_total'])
    console.log('outcalls_total', stats['outcalls_total'])
    console.log('incalls_per_operator', stats['incalls_per_operator'])
    console.log('outcalls_per_operator', stats['outcalls_per_operator'])
    expect(stats['incalls_total']).toBeTruthy()
    expect(stats['outcalls_total']).toBeTruthy()
    expect(stats['incalls_per_operator']).toBeTruthy()
    expect(stats['outcalls_per_operator']).toBeTruthy()
  })

  it('must return nut_advices_per_operator_total, coachings_per_operator_total, declined_per_operator_total, unreachables_per_operator_total, useful_contacts_per_operator_total, renewed_coachings_per_operator_total, coa_cu_transformation_per_operator_total, cn_cu_transformation_per_operator_total', async () => {
    const stats = await computeStatistics({ fields: ['nut_advices_per_operator_total', 'coachings_per_operator_total', 'declined_per_operator_total', 'unreachables_per_operator_total', 'useful_contacts_per_operator_total', 'renewed_coachings_per_operator_total', 'coa_cu_transformation_per_operator_total', 'cn_cu_transformation_per_operator_total'] })
    console.log('nut_advices_per_operator_total', stats['nut_advices_per_operator_total'])
    console.log('coachings_per_operator_total', stats['coachings_per_operator_total'])
    console.log('declined_per_operator_total', stats['declined_per_operator_total'])
    console.log('unreachables_per_operator_total', stats['unreachables_per_operator_total'])
    console.log('useful_contacts_per_operator_total', stats['useful_contacts_per_operator_total'])
    console.log('renewed_coachings_per_operator_total', stats['renewed_coachings_per_operator_total'])
    console.log('coa_cu_transformation_per_operator_total', stats['coa_cu_transformation_per_operator_total'])
    console.log('cn_cu_transformation_per_operator_total', stats['cn_cu_transformation_per_operator_total'])
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
    const stats = await computeStatistics({ fields: ['nut_advices_per_operator_details', 'coachings_per_operator_details', 'declined_per_operator_details', 'unreachables_per_operator_details', 'useful_contacts_per_operator_details', 'renewed_coachings_per_operator_details', 'coa_cu_transformation_per_operator_details', 'cn_cu_transformation_per_operator_details'] })
    console.log('nut_advices_per_operator_details', stats['nut_advices_per_operator_details'])
    console.log('coachings_per_operator_details', stats['coachings_per_operator_details'])
    console.log('declined_per_operator_details', stats['declined_per_operator_details'])
    console.log('unreachables_per_operator_details', stats['unreachables_per_operator_details'])
    console.log('useful_contacts_per_operator_details', stats['useful_contacts_per_operator_details'])
    console.log('renewed_coachings_per_operator_details', stats['renewed_coachings_per_operator_details'])
    console.log('coa_cu_transformation_per_operator_details', stats['coa_cu_transformation_per_operator_details'])
    console.log('cn_cu_transformation_per_operator_details', stats['cn_cu_transformation_per_operator_details'])
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
    console.log('leads_by_campain', stats['leads_by_campain'])
    expect(stats['leads_by_campain']).toBeTruthy()
  })

  it('must return webinars_by_company_details, webinars_by_company_total', async () => {
    const stats = await computeStatistics({ fields: ['webinars_by_company_details', 'webinars_by_company_total'] })
    console.log('webinars_by_company_details', stats['webinars_by_company_details'])
    console.log('webinars_by_company_total', stats['webinars_by_company_total'])
    expect(stats['webinars_by_company_details']).toBeTruthy()
    expect(stats['webinars_by_company_total']).toBeTruthy()
  })
})
