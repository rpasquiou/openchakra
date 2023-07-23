const { PERIOD } = require('../../server/plugins/smartdiet/consts')
const moment = require('moment')
const {forceDataModelDeck, buildAttributesException}=require('../utils')

forceDataModelDeck()

require('../../server/plugins/deck/functions')

const mongoose = require('mongoose')
const {MONGOOSE_OPTIONS, loadFromDb} = require('../../server/utils/database')

const Deck = require('../../server/models/Deck')

const DATA={
  name: 'Test',
  length: 680,
  width: 470,
  quincunx: false,
  beams_length: 240,
  piers_spacing: 50,
  planks_spacing: 0.8,
  plank_length: 240, 
  plank_width: 14.4,
}

describe('Compute deck', () => {

  beforeAll(async() => {
    await mongoose.connect(`mongodb://localhost/test${moment().unix()}`, MONGOOSE_OPTIONS)
  })

  afterAll(async() => {
    await mongoose.connection.dropDatabase()
    await mongoose.connection.close()
  })

  it('must compute placks count', () => {
    return Deck.create(DATA)
      .then(deck => console.log(deck.toString()))
  })

})
