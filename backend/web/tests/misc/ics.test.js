const moment=require('moment')
const fs=require('fs')
const { generateIcs } = require("../../utils/ics")

describe('ICS tests', () => {

  test('Must generate ics', async() => {
    const START=moment()
    const END=moment(START).add(1, 'hour')
    const TITLE = 'Webinaire'
    const URL = 'https://www.google.fr'
    const result=await generateIcs({start: START, end: END, title: TITLE, url: URL})
    const dateToIcsFormat = date => date.toISOString().replace(/\.\d*/, '').replace(/[-:]/g, '').slice(0, 13)
    expect(result).toMatch(new RegExp(`DTSTART:${dateToIcsFormat(START)}`))
    expect(result).toMatch(new RegExp(`DTEND:${dateToIcsFormat(END)}`))
    expect(result).toMatch(new RegExp(`SUMMARY:${TITLE}`))
    expect(result).toMatch(new RegExp(`URL:${URL}`))
  })

})
