const lodash=require('lodash')
const { COMPANY_ACTIVITY, DEPARTEMENTS } = require("../../server/plugins/all-inclusive/consts")
const { normalize } = require('../../utils/text')

describe('Constants tests', () => {

  let mission, quotation

  beforeAll(async () => {
  })

  afterAll(async() => {
  })

  it(`Activity 'autre' must appear first`, async() => {
    expect(Object.values(COMPANY_ACTIVITY)[0]).toEqual('Autre')
    const otherValues=Object.values(COMPANY_ACTIVITY).slice(1)
    expect(otherValues.map(normalize)).toEqual(lodash.sortBy(otherValues.map(normalize)))
  })

  it(`Departments must be sorted by number`, async() => {
    const depts=DEPARTEMENTS
    const numbers=Object.keys(DEPARTEMENTS)
    console.log(depts)
  })

})
