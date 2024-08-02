const { ROLE_CUSTOMER, SOURCE, EXPERIENCE, WORK_DURATION, DURATION_MONTH, MOBILITY_NONE } = require("../../../server/plugins/sosynpl/consts");

const CUSTOMER_DATA = { 
    password: "tagada",
    email: "test@test.com",
    firstname: "firstname",
    lastname: "lastname",
    role: ROLE_CUSTOMER,
    siren: '850148867',
    company_name: 'Wappizy',
    cgu_accepted: true,
    phone: '0675774324',
    position: 'Dev'
}

const FREELANCE_DATA = {
  ...CUSTOMER_DATA,
  source: Object.keys(SOURCE)[0],
  linkedin: 'lien',
  experience: '5',
  motivation: 'très motivé',
  main_experience: Object.keys(EXPERIENCE)[0], 
  main_job: 'dev',
  work_duration: [Object.keys(WORK_DURATION)[0]],
  address: {},
}

const JOB_FILE_DATA = {
  code: 'A0000',
  name: 'Informatique'
}

const JOB_DATA = {
  name: 'dev',
}

const SECTOR_DATA = {
  name: 'Aéronautique',
}

const CATEGORY_DATA = {
  name: 'catégorie',
}

const ANNOUNCE_DATA = {
  title: 'dev',
  experience: Object.keys(EXPERIENCE)[0],
  duration: 2,
  duration_unit: DURATION_MONTH,
  budget: '6969669',
  mobility_days_per_month: 2,
  mobility: MOBILITY_NONE,
  city: {
    address: 'Place du Vieux-Marché',
    city: 'Rouen',
    zip_code: '76000',
    country: 'France',
    latitude: 49.4431,
    longitude: 1.0993,
  }
}

module.exports = {
  CUSTOMER_DATA, FREELANCE_DATA, JOB_DATA, JOB_FILE_DATA, SECTOR_DATA, CATEGORY_DATA, ANNOUNCE_DATA,
}
