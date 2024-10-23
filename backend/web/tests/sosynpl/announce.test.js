const mongoose = require('mongoose')
const lodash = require('lodash')
const moment = require('moment')
const { MONGOOSE_OPTIONS } = require('../../server/utils/database')
const Announce = require('../../server/models/Announce')
const {ANNOUNCE_DATA, SECTOR_DATA}=require('./data/base_data')
const { clone } = require('../../server/plugins/sosynpl/announce')
const { CREATED_AT_ATTRIBUTE, UPDATED_AT_ATTRIBUTE, LANGUAGES, LANGUAGE_LEVEL, LANGUAGE_LEVEL_ADVANCED, REGIONS } = require('../../utils/consts')
const { EXPERIENCE, ROLE_CUSTOMER, EXPERIENCE_EXPERT, DURATION_MONTH, MOBILITY_FRANCE } = require('../../server/plugins/sosynpl/consts')
const LanguageLevel = require('../../server/models/LanguageLevel')
const User = require('../../server/models/User')
const Sector = require('../../server/models/Sector')
const Expertise = require('../../server/models/Expertise')
const Software = require('../../server/models/Software')

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

  it.only(`must create announce only if start_date is tomorrow or later`, async () => {
    const user = await User.create({firstname: `test`, lastname: `test`, email: `test@test.com`, role: ROLE_CUSTOMER, password: `test`})
    const sector = await Sector.create(SECTOR_DATA)
    const expertise1 = await Expertise.create({ name: 'JavaScript' })
    const expertise2 = await Expertise.create({ name: 'Java' })
    const expertise3 = await Expertise.create({ name: 'Python' })
    const software = await Software.create({ name: 'VS Code' })
    const language = await LanguageLevel.create({ language: 'fr', level: LANGUAGE_LEVEL_ADVANCED })
    const msa = {
      address: 'Place Colbert',
      city: 'Mont Saint Aignan',
      zip_code: '76130',
      country: 'France',
      latitude: 49.4655,
      longitude: 1.0877,
    }
    let err
    try {
      await Announce.create({
        user: new mongoose.Types.ObjectId(),
        title: 'Senior Developer',
        experience: [EXPERIENCE_EXPERT],
        start_date: new Date(2024, 6, 20),
        duration: 3, 
        duration_unit: DURATION_MONTH,
        sectors: [sector._id],
        homework_days: 3, 
        mobility: MOBILITY_FRANCE,
        mobility_regions: [Object.keys(REGIONS)[2], Object.keys(REGIONS)[3]],
        mobility_days_per_month: 10, 
        budget: 5000, 
        budget_hidden: false, 
        expertises: [expertise1._id, expertise2._id, expertise3._id],
        pinned_expertises: [expertise1._id],
        softwares: [software._id],
        languages: [language._id],
        city: msa,
      })
    }
    catch(e) {
      err=e
    }
    expect(err).toBeTruthy()
  })

})
