const mongoose = require('mongoose');
const { computeStatistics, preProcessGetNEVERUSE, preProcessGet } = require('../../server/plugins/smartdiet/functions');
const { MONGOOSE_OPTIONS } = require('../../server/utils/database');
const User = require('../../server/models/User');
require('../../server/models/FoodDocument');
const moment = require('moment');
const { ROLE_SUPER_ADMIN } = require('../../server/plugins/smartdiet/consts');
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
  const startDate = new Date('2020-01-05T13:00:00.000Z');
  const endDate = new Date('2021-01-05T13:00:00.000Z');
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

      const withDates = await testCoachingStats(field, { startDate, endDate });
      expect(withDates).toBeGreaterThanOrEqual(0);

      const withAll = await testCoachingStats(field, { id, diet, startDate, endDate });
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
    const startDate = new Date('2020-01-05T13:00:00.000Z');
    const endDate = new Date('2021-01-05T13:00:00.000Z');
    const id = '65f2f95bd449f912a30afe74';
    const diet = '65f2faa6234cec144a11fb3f';
    const stats = await computeStatistics({ fields: ['coachings_stats']});
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
    const startDate = new Date('2020-01-05T13:00:00.000Z');
    const endDate = new Date('2021-01-05T13:00:00.000Z');
    const id = '65f2f95bd449f912a30afe74';
    const diet = '65f2faa6234cec144a11fb3f';
    const stats = await computeStatistics({ fields: ['jobs_details', 'jobs_total']});

    expect(stats['jobs_total']).toBeGreaterThanOrEqual(0);
    expect(stats['jobs_details']).toBeTruthy();
  });

  it('must return join_reasons_details, join_reasons_total', async () => {
    const startDate = new Date('2020-01-05T13:00:00.000Z');
    const endDate = new Date('2021-01-05T13:00:00.000Z');
    const id = '65f2f95bd449f912a30afe74';
    const diet = '65f2faa6234cec144a11fb3f';
    const stats = await computeStatistics({ fields: ['join_reasons_details', 'join_reasons_total']});
    expect(stats['join_reasons_total']).toBeGreaterThanOrEqual(0);
    expect(stats['join_reasons_details']).not.toBeNull();
  });

  it('must return decline_reasons_details, decline_reasons_total', async () => {
    const startDate = new Date('2020-01-05T13:00:00.000Z');
    const endDate = new Date('2021-01-05T13:00:00.000Z');
    const id = '65f2f95bd449f912a30afe74';
    const diet = '65f2faa6234cec144a11fb3f';
    const stats = await computeStatistics({ fields: ['decline_reasons_details', 'decline_reasons_total']});
    expect(stats['decline_reasons_details']).toBeTruthy();
    expect(stats['decline_reasons_total']).toBeGreaterThanOrEqual(0);
  });

  it('must return ratio_stopped_started', async () => {
    const startDate = new Date('2020-01-05T13:00:00.000Z');
    const endDate = new Date('2021-01-05T13:00:00.000Z');
    const id = '65f2f95bd449f912a30afe74';
    const diet = '65f2faa6234cec144a11fb3f';
    const stats = await computeStatistics({ fields: ['ratio_stopped_started']});

    expect(stats['ratio_stopped_started']).toBeGreaterThanOrEqual(0);
  });

  it('must return ratio_dropped_started', async () => {
    const startDate = new Date('2020-01-05T13:00:00.000Z');
    const endDate = new Date('2021-01-05T13:00:00.000Z');
    const id = '65f2f95bd449f912a30afe74';
    const diet = '65f2faa6234cec144a11fb3f';
    const stats = await computeStatistics({ fields: ['ratio_dropped_started']});

    expect(stats['ratio_dropped_started']).toBeGreaterThanOrEqual(0);
  });

  it('must return leads_by_campain', async () => {
    const startDate = new Date('2020-01-05T13:00:00.000Z');
    const endDate = new Date('2021-01-05T13:00:00.000Z');
    const id = '65f2f95bd449f912a30afe74';
    const diet = '65f2faa6234cec144a11fb3f';
    const stats = await computeStatistics({ fields: ['leads_by_campain']});

    expect(stats['leads_by_campain']).toBeTruthy();
  });

  it('must return webinars_by_company_details, webinars_by_company_total', async () => {
    const startDate = new Date('2020-01-05T13:00:00.000Z');
    const endDate = new Date('2021-01-05T13:00:00.000Z');
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
  it.only('must get filters and treat them properly', async() => {
    const params = []
    params['filter.startDate'] = '2020-01-05T13:00:00.000Z',
    params['filter.endDate'] = '2022-01-05T13:00:00.000Z'
    params['filter.id'] = '65f2f95bd449f912a30afe74'
    params['filter.diet'] = '65f2faa6234cec144a11fb3f'
    params['limit'] = 30
    console.table(params)

    const fields=[
      'coachings_started',
    ]
    const user = await User.find({role: ROLE_SUPER_ADMIN})
    const model='adminDashboard'

    const result = await preProcessGet({ model, fields, user, params })
    console.log(result.decline_reasons_total)
    return true
  })
});

