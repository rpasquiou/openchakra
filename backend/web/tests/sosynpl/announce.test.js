const mongoose = require('mongoose')
const lodash = require('lodash')
const moment = require('moment')
const { MONGOOSE_OPTIONS } = require('../../server/utils/database')
const Announce = require('../../server/models/Announce')
const {ANNOUNCE_DATA}=require('./data/base_data')
const { clone } = require('../../server/plugins/sosynpl/announce')
const ExpertiseCategory = require('../../server/models/ExpertiseCategory')
const { CREATED_AT_ATTRIBUTE, UPDATED_AT_ATTRIBUTE, LANGUAGES, LANGUAGE_LEVEL } = require('../../utils/consts')
const { EXPERIENCE } = require('../../server/plugins/sosynpl/consts')
const LanguageLevel = require('../../server/models/LanguageLevel')

describe('Test announces', () => {

  beforeAll(async () => {
    const DBNAME=`test${moment().unix()}`
    await mongoose.connect(`mongodb://localhost/${DBNAME}`, MONGOOSE_OPTIONS)
  })
  
  afterAll(async () => {
    await mongoose.connection.dropDatabase()
    await mongoose.connection.close()
  })

  const cleanAnnounce = announce =>  {
    return lodash.omitBy(announce.toObject(), (v, k) => ['_id', 'id', '__v', CREATED_AT_ATTRIBUTE, UPDATED_AT_ATTRIBUTE].includes(k))
  }
  
  it('must clone a draft announce', async () => {
    let announce=await new Announce({...ANNOUNCE_DATA}).save({validateBeforeSave: false})
    let cloned_id=await clone(announce._id)
    let cloned=await Announce.findById(cloned_id)
    expect(cleanAnnounce(cloned)).toEqual(cleanAnnounce(announce))
    announce.experience=Object.keys(EXPERIENCE).slice(0, 2)
    await announce.save({validateBeforeSave: false})
    cloned_id=await clone(announce._id)
    cloned=await Announce.findById(cloned_id)
    expect(cleanAnnounce(cloned)).toEqual(cleanAnnounce(announce))
    const language=await new LanguageLevel({language: Object.keys(LANGUAGES)[0], level: Object.keys(LANGUAGE_LEVEL)[0]}).save()
    announce.languages=[language._id]
    await announce.save({validateBeforeSave: false})
    cloned_id=await clone(announce._id)
    cloned=await Announce.findById(cloned_id).populate('languages')
    announce=await Announce.findById(announce._id).populate('languages')
    expect(cleanAnnounce(cloned)).toEqual(cleanAnnounce(announce))
  })

})

