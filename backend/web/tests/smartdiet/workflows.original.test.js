const {
  WORKFLOWS,
  computeWorkflowLists,
} = require('../../server/plugins/smartdiet/workflows')
const { MONGOOSE_OPTIONS, loadFromDb } = require('../../server/utils/database')
const mongoose = require('mongoose')
const { getDatabaseUri } = require('../../config/config')
const PROVIDER = require('../../server/utils/mailjet')

jest.setTimeout(50000)

describe('Worflows', () => {

  const OUVREUR='ouvreurnoninscrit@gmail.com'

  beforeAll(async() => {
    await mongoose.connect(getDatabaseUri(), MONGOOSE_OPTIONS)
  })

  afterAll(async() => {
    await mongoose.connection.close()
  })

  const emailContained = email => {
    return expect.arrayContaining([expect.objectContaining( {Email: email})])
  }


  it('must filter CL_ADH_LEAD_COA_NOGROUP_NOT_OPENED', async() => {
    const result=await computeWorkflowLists()
    Object.entries(result).forEach(([name, list]) => {
      // console.log(Object.keys(list))
      if (list.add.find(v => v.Email==OUVREUR)) {
        console.log(name, list.id, 'added')
      }
    })
  })

  it('Must get the scenario from list', async () => {
    const scenario_ids=await PROVIDER.getWorkflowsForContactsList({list: 2414836})
    expect(scenario_ids).toContain(119193)
  })


})
