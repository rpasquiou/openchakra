const moment=require('moment')
const fs=require('fs')
const { generateIcs } = require("../../utils/ics")
const { getLocationSuggestions } = require('../../utils/geo')

describe('GEO tests', () => {

  test('Must return city suggestions', async() => {
    const result=await getLocationSuggestions('Rouen', 'city')
    console.log(result)
  })

})
