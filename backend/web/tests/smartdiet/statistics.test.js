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

  it('must return started_coaching_18_24', async()=>{
    const stats = await computeStatistics({ fields: ['started_coachings_18_24']});
    console.log('started_coachings_18_24',stats['started_coachings_18_24'])
    expect(stats['started_coachings_18_24']).toBeGreaterThanOrEqual(0)
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

  it('must return job_1_total and job_5_percent and jobs_total', async()=>{
    const stats = await computeStatistics({ fields: ['job_1_total', 'job_5_percent','job_3_name', 'jobs_total']});
    console.log('job_1_total',stats['job_1_total']);
    console.log('job_5_percent',stats['job_5_percent']);
    console.log('jobs_total',stats['jobs_total']);
    console.log('job_3_name',stats['job_3_name']);
    expect(stats['job_1_total']).toBeGreaterThanOrEqual(0);
    expect(stats['job_5_percent']).toBeGreaterThanOrEqual(0);
    expect(stats['job_3_name']).not.toBeNull();
    expect(stats['jobs_total']).toBeGreaterThanOrEqual(0);
  })

  it('must return join_reason_1_total and join_reason_5_percent and join_reasons_total', async()=>{
    const stats = await computeStatistics({ fields: ['join_reason_1_total', 'join_reason_5_percent','join_reason_3_name', 'join_reasons_total']});
    console.log('join_reason_1_total',stats['join_reason_1_total']);
    console.log('join_reason_5_percent',stats['join_reason_5_percent']);
    console.log('join_reasons_total',stats['join_reasons_total']);
    console.log('join_reason_3_name',stats['join_reason_3_name']);
    expect(stats['join_reason_1_total']).toBeGreaterThanOrEqual(0);
    expect(stats['join_reason_5_percent']).toBeGreaterThanOrEqual(0);
    expect(stats['join_reason_3_name']).not.toBeNull();
    expect(stats['join_reasons_total']).toBeGreaterThanOrEqual(0);
  })

  it.only('must return decline_reason_1_total and decline_reason_5_percent and decline_reasons_total', async()=>{
    const stats = await computeStatistics({ fields: ['decline_reason_1_total', 'decline_reason_5_percent','decline_reason_3_name', 'decline_reasons_total']});
    console.log('decline_reason_1_total',stats['decline_reason_1_total']);
    console.log('decline_reason_5_percent',stats['decline_reason_5_percent']);
    console.log('decline_reasons_total',stats['decline_reasons_total']);
    console.log('decline_reason_3_name',stats['decline_reason_3_name']);
    expect(stats['decline_reason_1_total']).toBeGreaterThanOrEqual(0);
    expect(stats['decline_reason_5_percent']).toBeGreaterThanOrEqual(0);
    expect(stats['decline_reason_3_name']).not.toBeNull();
    expect(stats['decline_reasons_total']).toBeGreaterThanOrEqual(0);
  })

})
