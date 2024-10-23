const mongoose = require('mongoose')
const moment = require('moment')
const { MONGOOSE_OPTIONS, loadFromDb } = require('../../server/utils/database')
const Announce = require('../../server/models/Announce')
const Job = require('../../server/models/Job')
const Sector = require('../../server/models/Sector')
const Expertise = require('../../server/models/Expertise')
const Software = require('../../server/models/Software')
const LanguageLevel = require('../../server/models/LanguageLevel')
const CustomerFreelance = require('../../server/models/CustomerFreelance')
const SoftSkill = require('../../server/models/SoftSkill')
const JobFile = require('../../server/models/JobFile')
const { LANGUAGE_LEVEL_ADVANCED, REGIONS } = require('../../utils/consts')
const { EXPERIENCE_EXPERT, DURATION_MONTH, MOBILITY_FRANCE, SOURCE_RECOMMANDATION, WORK_MODE_REMOTE_SITE, WORK_DURATION__1_TO_6_MONTHS, AVAILABILITY_ON, AVAILABILITY_OFF, MOBILITY_CITY, MOBILITY_NONE, MOBILITY_REGIONS, COMPANY_SIZE_LESS_10, ROLE_CUSTOMER } = require('../../server/plugins/sosynpl/consts')
const { computeDistanceKm } = require('../../utils/functions')
const User = require('../../server/models/User')
require('../../server/plugins/sosynpl/functions')
require('../../server/plugins/sosynpl/announce')
require('../../server/models/JobFile')
require('../../server/models/Application')
require('../../server/models/Expertise')
require('../../server/models/Experience')
require('../../server/models/Training')

describe('search perf', () => {
  beforeAll(async () => {
    await mongoose.connect(`mongodb://localhost/sosynpl`, MONGOOSE_OPTIONS)
  })
  afterAll(async() => {
    await mongoose.connection.close()
  })
  it('must compute search perf', async () => {
    const id = `66e92830f213085bf5db8580`
    const user = await User.findOne({role: ROLE_CUSTOMER})
    const fields = [
      `announces.user.company_logo`,
      `announces.user.company_name`,
      `announces.title`,
      `announces.start_date`,
      `announces.duration`,
      `announces.city`,
      `announces.pinned_expertises.name`,
      `announces.pinned_expertises`,
      `announces`,
      `announces.duration_unit`,
      `announces.status`,
      `announces.average_daily_rate`,
      `profiles`,
      `profiles_count`,
      `pattern`,
      `city_radius`,
      `profiles.picture`,
      `profiles.shortname`,
      `profiles.position`,
      `profiles.rate`,
      `profiles.freelance_average_note`,
      `profiles.freelance_evaluations_count`,
      `profiles.registration_city`,
      // `profiles.pinned`,
      `profiles.pinned_expertises.name`,
      `profiles.pinned_expertises`,
      `city`,
      `available`,
      `announces_count`,
      `min_daily_rate`,
      `max_daily_rate`,
      `profiles.experience`,
      `profiles.activity_status`,
      `expertises`,
      `work_durations`,
      `sectors`,
      `work_modes`,
      `pilars`,
      `experiences`,
      `profiles.availability_str`,
      `profiles.availability`
    ]
    console.time(`search`)
    const stat = await loadFromDb({model: `search`, user, fields, id})
    console.timeEnd(`search`)
  })
})