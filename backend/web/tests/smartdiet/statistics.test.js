const mongoose = require('mongoose');
const { computeStatistics } = require('../../server/plugins/smartdiet/functions');
const { MONGOOSE_OPTIONS } = require('../../server/utils/database');

jest.setTimeout(50000)


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

  it('must return cs_done equals to 28316', async () => {
    const stats = await computeStatistics({ fields: ['cs_done'] });

    let totalCount = 0;
    for (const order in stats.cs_done) {
        console.log(`${order}: ${stats.cs_done[order]}`);
        totalCount+= stats.cs_done[order];
    }
    expect(totalCount).toEqual(28316);
  });
  it.only('must return cs_done_c1', async () => {
    const stats = await computeStatistics({ fields: ['cs_done_c1'] });
    console.log(stats.cs_done_c1)
    expect(stats.cs_done_c1).not.toBeNull();
  });




  //TODO : finish nut_advices first
  // it.only('must return nut_advices not to be null', async() => {
  //   const stats=await computeStatistics({fields:[`nut_advices`]})
  //   console.log(stats.nut_advices)
  //   expect(stats.nut_advices).not.toBeNull()
  // })

})
