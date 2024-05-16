const { ROLE_CUSTOMER, SOURCE, EXPERIENCE, WORK_DURATION } = require("../../../server/plugins/sosynpl/consts");

const CUSTOMER_DATA={ 
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
const FREELANCE_DATA= {
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

const JOB_FILE_DATA={
  code: 'A0000',
  name: 'Informatique'
}

const JOB_DATA={
  name: 'dev',
}

const SECTOR_DATA={
  name: 'Aéronautique',
}

const CATEGORY_DATA={
  name: 'catégorie',
}

module.exports={
  CUSTOMER_DATA, FREELANCE_DATA, JOB_DATA, JOB_FILE_DATA, SECTOR_DATA, CATEGORY_DATA,
}
