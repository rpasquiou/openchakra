const mongoose = require('mongoose');
const { computeStatistics } = require('../../server/plugins/smartdiet/functions');
const { MONGOOSE_OPTIONS } = require('../../server/utils/database');

jest.setTimeout(300000)


describe('Statistics', () => {

  beforeEach(async() => {
      await mongoose.connect(`mongodb://localhost/smartdiet`, MONGOOSE_OPTIONS)
  })

  afterEach(async () => {
    await mongoose.connection.close()
  })

  it('must return coachings_started equals to 9623', async() => {
    const stats=await computeStatistics({fields:[`coachings_started`]})
    expect(stats.coachings_started).toEqual(9623)
  })

  it('must return coachings_stopped equals to 2649', async() => {
    const stats=await computeStatistics({fields:[`coachings_stopped`]})
    console
    expect(stats.coachings_stopped).toEqual(2649)
  })

  it('must return coachings_dropped equals to 1814', async() => {
    const stats=await computeStatistics({fields:[`coachings_dropped`]})
    expect(stats.coachings_dropped).toEqual(1814)
  })

  it('must return coachings_ongoing equals to 43', async() => {
    const stats=await computeStatistics({fields:[`coachings_ongoing`]})
    expect(stats.coachings_ongoing).toEqual(43)
  })

  it('must return cs_done equals to 38', async () => {
    const stats = await computeStatistics({ fields: ['cs_done'] });
    expect(stats.cs_done).toEqual(38);
  });

  it('must return cs_done_c1', async () => {
    const stats = await computeStatistics({ fields: ['cs_done_c1'] });
    console.log(stats['cs_done_c1'])
    expect(stats['cs_done_c1']).not.toBeNull();
  });

  it('must return cs_upcoming equals to 4', async () => {
    const stats = await computeStatistics({ fields: ['cs_upcoming'] });
    expect(stats.cs_upcoming).toEqual(4);
  });


  it('must return cs_upcoming_c1', async () => {
    const stats = await computeStatistics({ fields: ['cs_upcoming_c1'] });
    console.log('cs_upcoming_c1',stats['cs_upcoming_c1'])
    expect(stats['cs_upcoming_c1']).not.toBeNull();
  });

  it('must return started_coaching_no_birthday', async()=>{
    const stats = await computeStatistics({ fields: ['started_coaching_no_birthday']});
    console.log('started_coaching_no_birthday',stats['started_coaching_no_birthday'])
    expect(stats['started_coaching_no_birthday']).not.toBeNull
  })

  it('must return started_coachings_18_24', async()=>{
    const stats = await computeStatistics({ fields: ['started_coachings_18_24']});
    console.log('started_coachings_18_24',stats['started_coachings_18_24'])
    expect(stats['started_coachings_18_24']).toBeGreaterThanOrEqual(0)
  })

  it('must return started_coachings_25_29_percent', async()=>{
    const stats = await computeStatistics({ fields: ['started_coachings_25_29_percent']});
    console.log('started_coachings_25_29_percent',stats['started_coachings_25_29_percent'])
    expect(stats['started_coachings_25_29_percent']).toBeGreaterThanOrEqual(0)
  })

  it('must return coachings_male', async()=>{
    const stats = await computeStatistics({ fields: ['coachings_male']});
    console.log('coachings_male',stats['coachings_male'])
    expect(stats['coachings_male']).toBeGreaterThanOrEqual(0)
  })

  it('must return coachings_unknown', async()=>{
    const stats = await computeStatistics({ fields: ['coachings_unknown']});
    console.log('coachings_unknown',stats['coachings_unknown'])
    expect(stats['coachings_unknown']).toBeGreaterThanOrEqual(0)
  })

  it('must return nut_advices', async()=>{
    const stats = await computeStatistics({ fields: ['nut_advices']});
    console.log('nut_advices',stats['nut_advices'])
    expect(stats['nut_advices']).toBeGreaterThanOrEqual(0)
  })

  it('must return coachings_renewed', async()=>{
    const stats = await computeStatistics({ fields: ['nut_adcoachings_renewedvices']});
    console.log('coachings_renewed',stats['coachings_renewed'])
    expect(stats['coachings_renewed']).toBeGreaterThanOrEqual(0)
  })

  it('must return jobs_details, jobs_total', async()=>{
    const stats = await computeStatistics({ fields: ['jobs_details, jobs_total']});
    console.log('jobs_details',stats['jobs_details']);
    console.log('jobs_total',stats['jobs_total']);
    expect(stats['jobs_total']).toBeGreaterThanOrEqual(0);
    expect(stats['jobs_details']).toBeTruthy();
  })

  it('must return join_reasons_details, join_reasons_total', async()=>{
    const stats = await computeStatistics({ fields: ['join_reasons_details, join_reasons_total']});
    console.log('join_reasons_details',stats['join_reasons_details']);
    console.log('join_reasons_total',stats['join_reasons_total']);
    expect(stats['join_reasons_total']).toBeGreaterThanOrEqual(0);
    expect(stats['join_reasons_details']).not.toBeNull();
  })

  it('must return decline_reasons_details, decline_reasons_total', async()=>{
    const stats = await computeStatistics({ fields: ['decline_reasons_details, decline_reasons_total']});
    console.log('decline_reasons_details',stats['decline_reasons_details']);
    console.log('decline_reasons_total',stats['decline_reasons_total']);
    expect(stats['decline_reasons_details']).toBeTruthy();
    expect(stats['decline_reasons_total']).toBeGreaterThanOrEqual(0);
  })

  it('must return ratio_stopped_started', async()=>{
    const stats = await computeStatistics({ fields: ['ratio_stopped_started']});
    console.log('ratio_stopped_started',stats['ratio_stopped_started'])
    expect(stats['ratio_stopped_started']).toBeGreaterThanOrEqual(0)
  })

  it('must return ratio_dropped_started', async()=>{
    const stats = await computeStatistics({ fields: ['ratio_dropped_started']});
    console.log('ratio_dropped_started',stats['ratio_dropped_started'])
    expect(stats['ratio_dropped_started']).toBeGreaterThanOrEqual(0)
  })

  it('must return incalls_total, outcalls_total, incalls_per_operator, outcalls_per_operator', async()=>{
    const stats = await computeStatistics({ fields: ['incalls_total, outcalls_total, incalls_per_operator, outcalls_per_operator']});
    console.log('incalls_total',stats['incalls_total'])
    console.log('outcalls_total',stats['outcalls_total'])
    console.log('incalls_per_operator',stats['incalls_per_operator'])
    console.log('outcalls_per_operator',stats['outcalls_per_operator'])
    expect(stats['incalls_total']).toBeTruthy();
    expect(stats['outcalls_total']).toBeTruthy();
    expect(stats['incalls_per_operator']).toBeTruthy();
    expect(stats['outcalls_per_operator']).toBeTruthy();
  })
  it.only('must return nut_advices_per_operator_total, coachings_per_operator_total, declined_per_operator_total, unreachables_per_operator_total, useful_contacts_per_operator_total', async()=>{
    const stats = await computeStatistics({ fields: ['nut_advices_per_operator_total, coachings_per_operator_total, declined_per_operator_total, unreachables_per_operator_total, useful_contacts_per_operator_total']});
    console.log('nut_advices_per_operator_total',stats['nut_advices_per_operator_total'])
    console.log('coachings_per_operator_total',stats['coachings_per_operator_total'])
    console.log('declined_per_operator_total',stats['declined_per_operator_total'])
    console.log('unreachables_per_operator_total',stats['unreachables_per_operator_total'])
    console.log('useful_contacts_per_operator_total',stats['useful_contacts_per_operator_total'])
    expect(stats['nut_advices_per_operator_total']).toBeGreaterThanOrEqual(0);
    expect(stats['coachings_per_operator_total']).toBeGreaterThanOrEqual(0);
    expect(stats['declined_per_operator_total']).toBeGreaterThanOrEqual(0);
    expect(stats['unreachables_per_operator_total']).toBeGreaterThanOrEqual(0);
    expect(stats['useful_contacts_per_operator_total']).toBeGreaterThanOrEqual(0);
  })
  it.only('must return nut_advices_per_operator_details, coachings_per_operator_details, declined_per_operator_details, unreachables_per_operator_details, useful_contacts_per_operator_details', async()=>{
    const stats = await computeStatistics({ fields: ['nut_advices_per_operator_details, coachings_per_operator_details, declined_per_operator_details, unreachables_per_operator_details, useful_contacts_per_operator_details']});
    console.table(stats['nut_advices_per_operator_details']);
    console.table(stats['coachings_per_operator_details']);
    console.table(stats['declined_per_operator_details']);
    console.table(stats['unreachables_per_operator_details']);
    console.table(stats['useful_contacts_per_operator_details']);
    expect(stats['nut_advices_per_operator_details']).toBeTruthy();
    expect(stats['coachings_per_operator_details']).toBeTruthy();
    expect(stats['declined_per_operator_details']).toBeTruthy();
    expect(stats['unreachables_per_operator_details']).toBeTruthy();
    expect(stats['useful_contacts_per_operator_details']).toBeTruthy();
  })
})
