const moment=require('moment')
const fs=require('fs')
const { generateIcs } = require("../../utils/ics")
const { getLocationSuggestions } = require('../../utils/geo')

describe('GEO tests', () => {

  test('Must return city suggestions', async() => {
    const result=await getLocationSuggestions('Rouen', 'city')
    expect(result).toHaveLength(2)
    expect(result[0].city).toEqual('Rouen')
    expect(result[1].city).toEqual('Seine-Maritime')
    expect(parseFloat(result[0].latitude)).toBeCloseTo(49.44)
    expect(parseFloat(result[0].longitude)).toBeCloseTo(1.09)
  })

})
