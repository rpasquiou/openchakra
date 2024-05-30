const mongoose = require('mongoose');
const { computeStatistics, preProcessGetNEVERUSE, preProcessGet, preProcessGetFORBIDDEN } = require('../../server/plugins/smartdiet/functions');
const { MONGOOSE_OPTIONS } = require('../../server/utils/database');
const User = require('../../server/models/User');
require('../../server/models/FoodDocument');
const moment = require('moment');
const { ROLE_SUPER_ADMIN, ROLE_EXTERNAL_DIET, ROLE_ADMIN } = require('../../server/plugins/smartdiet/consts');
const { diet_billing } = require('../../server/plugins/smartdiet/kpi');
jest.setTimeout(300000);

beforeAll(async () => {
  await mongoose.connect(`mongodb://localhost/smartdiet`, MONGOOSE_OPTIONS);
});

afterAll(async () => {
  await mongoose.connection.close();
});

describe('Statistics', () => {
  let now;
  const measures = [];
  const start_date = new Date('2020-01-05T13:00:00.000Z');
  const end_date = new Date('2021-01-05T13:00:00.000Z');
  const diet = '65f2faa9234cec144a11fbed';
  const id = '65f2f95bd449f912a30afe74';

  const measure = (field) => {
    measures[field] = moment().diff(now, 'milliseconds');
    console.table(measures)
    now = moment();
  };

  const testCoachingStats = async (field, options = {}) => {
    now = moment();
    const stats = await computeStatistics({ fields: [field], ...options });
    const count = stats[field];
    console.table({ [field]: count });
    measure(`${field} + ${options}`);
    return count;
  };

  const runTest = (field) => {
    it(`must return ${field}`, async () => {
      const base = await testCoachingStats(field);
      expect(base).toBeGreaterThanOrEqual(0);

      const withId = await testCoachingStats(field, { id });
      expect(withId).toBeGreaterThanOrEqual(0);

      const withDiet = await testCoachingStats(field, { diet });
      console.log(typeof(withDiet))
      expect(withDiet).toBeGreaterThanOrEqual(0);

      const withDates = await testCoachingStats(field, { start_date, end_date });
      expect(withDates).toBeGreaterThanOrEqual(0);

      const withAll = await testCoachingStats(field, { id, diet, start_date, end_date });
      expect(withAll).toBeGreaterThanOrEqual(0);
    });
  };

  const fields = [
    'coachings_started',
    'coachings_stopped',
    'coachings_dropped',
    'coachings_ongoing',
    'coachings_finished',
    'coachings_gender_male',
    'coachings_gender_female',
    'coachings_gender_non_binary',
    'coachings_gender_unknown',
    'coachings_renewed',
    'nut_advices',
    'ratio_stopped_started',
    'ratio_dropped_started'
  ];

  fields.forEach(runTest);

  it('must return coachings_stats', async () => {
    const start_date = new Date('2020-01-05T13:00:00.000Z');
    const end_date = new Date('2021-01-05T13:00:00.000Z');
    const id = '65f2f95bd449f912a30afe74';
    const diet = '65f2faa6234cec144a11fb3f';
    const stats = await computeStatistics({ id, fields: ['coachings_stats']});
    for (let stat of stats.coachings_stats) {
      console.table({ name: stat.name, total: stat.total });
      console.log(stat.ranges);
      for (let app of stat.appointments) {
        console.table({ order: app.order, total: app.total });
        console.log(app.ranges);
        console.log('------------------------------------------------------------------');
      }
      console.log("******************************************************************************************************************************");
    }
    expect(stats.coachings_stats).toBeTruthy();
  });
  it('must return ratio_appointments_coaching', async () => {
    const stats = await computeStatistics({fields:['ratio_appointments_coaching']})
    expect(stats.ratio_appointments_coaching).toBeGreaterThanOrEqual(0)
  })
  it('must return jobs_details, jobs_total', async () => {
    const start_date = new Date('2020-01-05T13:00:00.000Z');
    const end_date = new Date('2021-01-05T13:00:00.000Z');
    const id = '65f2f95bd449f912a30afe74';
    const diet = '65f2faa6234cec144a11fb3f';
    const stats = await computeStatistics({ fields: ['jobs_details', 'jobs_total']});

    expect(stats['jobs_total']).toBeGreaterThanOrEqual(0);
    expect(stats['jobs_details']).toBeTruthy();
  });

  it('must return join_reasons_details, join_reasons_total', async () => {
    const start_date = new Date('2020-01-05T13:00:00.000Z');
    const end_date = new Date('2021-01-05T13:00:00.000Z');
    const id = '65f2f95bd449f912a30afe74';
    const diet = '65f2faa6234cec144a11fb3f';
    const stats = await computeStatistics({ fields: ['join_reasons_details', 'join_reasons_total']});
    expect(stats['join_reasons_total']).toBeGreaterThanOrEqual(0);
    expect(stats['join_reasons_details']).not.toBeNull();
  });

  it('must return decline_reasons_details, decline_reasons_total', async () => {
    const start_date = new Date('2020-01-05T13:00:00.000Z');
    const end_date = new Date('2021-01-05T13:00:00.000Z');
    const id = '65f2f95bd449f912a30afe74';
    const diet = '65f2faa6234cec144a11fb3f';
    const stats = await computeStatistics({ fields: ['decline_reasons_details', 'decline_reasons_total']});
    expect(stats['decline_reasons_details']).toBeTruthy();
    expect(stats['decline_reasons_total']).toBeGreaterThanOrEqual(0);
  });

  it('must return ratio_stopped_started', async () => {
    const start_date = new Date('2020-01-05T13:00:00.000Z');
    const end_date = new Date('2021-01-05T13:00:00.000Z');
    const id = '65f2f95bd449f912a30afe74';
    const diet = '65f2faa6234cec144a11fb3f';
    const stats = await computeStatistics({ fields: ['ratio_stopped_started']});

    expect(stats['ratio_stopped_started']).toBeGreaterThanOrEqual(0);
  });

  it('must return ratio_dropped_started', async () => {
    const start_date = new Date('2020-01-05T13:00:00.000Z');
    const end_date = new Date('2021-01-05T13:00:00.000Z');
    const id = '65f2f95bd449f912a30afe74';
    const diet = '65f2faa6234cec144a11fb3f';
    const stats = await computeStatistics({ fields: ['ratio_dropped_started']});

    expect(stats['ratio_dropped_started']).toBeGreaterThanOrEqual(0);
  });

  it('must return leads_by_campain', async () => {
    const start_date = new Date('2020-01-05T13:00:00.000Z');
    const end_date = new Date('2021-01-05T13:00:00.000Z');
    const id = '65f2f95bd449f912a30afe74';
    const diet = '65f2faa6234cec144a11fb3f';
    const stats = await computeStatistics({ fields: ['leads_by_campain']});

    expect(stats['leads_by_campain']).toBeTruthy();
  });

  it('must return webinars_by_company_details, webinars_by_company_total', async () => {
    const start_date = new Date('2020-01-05T13:00:00.000Z');
    const end_date = new Date('2021-01-05T13:00:00.000Z');
    const id = '65f2f95bd449f912a30afe74';
    const diet = '65f2faa6234cec144a11fb3f';
    const stats = await computeStatistics({ fields: ['webinars_by_company_details', 'webinars_by_company_total']});

    expect(stats['webinars_by_company_details']).toBeTruthy();
    expect(stats['webinars_by_company_total']).toBeGreaterThanOrEqual(0);
  });

  it('must return calls_stats', async () => {
    const operatorId = "65fc021f93262d3cef08bf35";
    const stats = await computeStatistics({ fields: ['calls_stats'] });
    console.log(stats.calls_stats);
    expect(stats['calls_stats']).toBeTruthy();
  });
  it('must compute all stats for kpi coaching page', async() => {
    let now = moment()
    let measures=[]
    const measure = (field) =>{
      measures[field]=moment().diff(now,'milliseconds')
      now=moment()
    }
    const fields=[
      'coachings_started',
      'coachings_ongoing',
      'coachings_stopped',
      'coachings_dropped',
      'coachings_finished',
      'coachings_renewed',
      'nut_advices',
      'ratio_dropped_started',
      'ratio_stopped_started',
      'ratio_appointments_coachings',
      'coachings_gender_female',
      'coachings_gender_male',
      'coachings_gender_non_binary',
      'coachings_gender_unknown',
      'coachings_stats',
    ]
  for(let field of fields){
    const stats = await computeStatistics({fields:[field]})
    measure(field)
  }
  const stats = await computeStatistics({fields:fields})
  measure('all')
  console.table(measures)
  expect(1).toEqual(1)
  })  
  it('must get filters and treat them properly', async() => {
    console.log('****************************************ADMIN****************************************')
    const userAdmin = await User.findOne({role: ROLE_ADMIN})
    const userDiet = await User.findOne({role: ROLE_EXTERNAL_DIET})
    let user
    let diet
    let id
    const timings = {}
    //first test, no filters, user is Admin
    const params = []
    params['limit'] = 30
    const fields=[]
    user = userAdmin
    const model='billing'
    
    let now = moment()
    const result = await preProcessGetFORBIDDEN({ model, id, fields, user, params })  
    console.log(result)
    timings.admin=moment().diff(now, 'milliseconds')
    const totalAdmin = result.data.total

    //Second test, no filters, user is Admin, has id
    console.log('****************************************ADMIN WITH ID****************************************')
    now = moment()
    diet = userDiet
    id = diet._id
    const idResult = await preProcessGetFORBIDDEN({ model, id, fields, user, params })  
    console.log(idResult)
    timings.admingWithDiet=moment().diff(now, 'milliseconds')
    const totalAdminDiet = idResult.data[0].total
  
    //Third test, no filters, user is Diet
    console.log('****************************************DIET****************************************')
    now=moment()
    user = diet
    const dietResult = await preProcessGetFORBIDDEN({model, id, fields, user, params})
    console.log(dietResult)
    timings.diet=moment().diff(now, 'milliseconds')
    const totalDiet = dietResult.data.length

    //Fourth test, date filters, user is Admin 
    console.log('****************************************ADMIN WITH DATE FILTERS****************************************')
    now=moment()
    params['filter.start_date'] = '2023-01-05T13:00:00.000Z',
    params['filter.end_date'] = '2024-01-05T13:00:00.000Z'
    user = userAdmin
    const filteredResult = await preProcessGetFORBIDDEN({ model, fields, user, params })  
    console.log(filteredResult)
    timings.adminDateFilter=moment().diff(now, 'milliseconds')
    const totalAdminDate = filteredResult.data.total

    //Fifth test, date filters, user is Diet
    console.log('****************************************DIET WITH DATE FILTERS****************************************')
    now=moment()
    user = userDiet
    const filteredDietResult = await preProcessGetFORBIDDEN({model, id, fields, user, params})
    console.log(filteredDietResult)
    timings.dietDateFilter=moment().diff(now, 'milliseconds')
    const totalDietDate = filteredDietResult.data.length


    console.table(timings)
    expect(totalAdmin).toBeGreaterThanOrEqual(0)
    expect(totalAdminDiet).toBeLessThanOrEqual(totalAdmin)
    expect(totalAdminDate).toBeLessThanOrEqual(totalAdmin)
    expect(totalDiet).toBeGreaterThanOrEqual(0)
    expect(totalDietDate).toBeGreaterThanOrEqual(0)

  })

  it.only(`Test computation times`, async() => {
    for await (const field of fields.filter(f => /coachings_gender_female/.test(f))) {
      console.time(field)
      const computedStaistics=await computeStatistics({fields:[field]})
      console.log(field, 'is',computedStaistics[field])
      console.timeEnd(field)
    }
  })
});


