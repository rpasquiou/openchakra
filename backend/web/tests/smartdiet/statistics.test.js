const mongoose = require('mongoose');
const { computeStatistics } = require('../../server/plugins/smartdiet/functions');
const { MONGOOSE_OPTIONS } = require('../../server/utils/database');

jest.setTimeout(100000)


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

  it.only('must return coachings_ongoing equals to 1814', async() => {
    const stats=await computeStatistics({fields:[`coachings_ongoing`]})
    expect(stats.coachings_ongoing).toEqual(1814)
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
    console.log(stats['cs_upcoming_c1'])
    expect(stats['cs_upcoming_c1']).not.toBeNull();
  });




  //TODO : finish nut_advices first
  // it.only('must return nut_advices not to be null', async() => {
  //   const stats=await computeStatistics({fields:[`nut_advices`]})
  //   console.log(stats.nut_advices)
  //   expect(stats.nut_advices).not.toBeNull()
  // })

})
