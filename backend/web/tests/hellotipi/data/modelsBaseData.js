const {
  COACHING,
  ROLE_COMPANY_BUYER,
  ROLE_TI,
  COACH_ALLE,
  BOOLEAN_YES,
  BOOLEAN_NO,
  MISSION_FREQUENCY_WEEKLY,
  MISSION_FREQUENCY_MONTHLY,
  MISSION_FREQUENCY_SEASONLY,
  MISSION_FREQUENCY_MULTI_YEARLY
} = require('../../../server/plugins/all-inclusive/consts')
const moment = require('moment')

const BASE={
  city: 'Rouen', zip_code:76, address:'address', birthday: moment().subtract(30, 'years'),
  password: 'passwd', phone: '0606060606', cguAccepted: true,
}

const TI_USER={...BASE,
  role: ROLE_TI, coaching: Object.keys(COACHING)[0],
  email: 'hello+ti@wappizy.com', lastname: 'TI', firstname: 'TI',
}

const CUSTOMER_USER={...BASE,
  role: ROLE_COMPANY_BUYER, city: 'Rouen', company_name:'company',
  email: 'hello+customer@wappizy.com', lastname: 'CUSTOMER', firstname: 'CUSTOMER',
}

const QUOTATION={
  ...CUSTOMER_USER, name: 'Devis',
}

const QUOTATION_DETAIL={
  vat: 0.15, ht_price:10, quantity: 1, label: 'Ligne détail',
}

const USER_DATA = {
  firstname: 'John',
  lastname: 'Doe',
  birthday: new Date('1990-01-01'),
  cguAccepted: true,
  password: 'Password1;',
  email: 'john.doe@example.com',
  coaching: COACH_ALLE,
  role: ROLE_TI,
  city: 'Paris',
  zip_code: '75',
  address: '1 rue de Paris',
  phone: '+33612345678',
}

const LEAD_DATA = {
  fullname: 'Jane Doe',
  email: 'jane.doe@example.com',
}

const JOB_USER_DATA = {
  name: 'Peintre',
}

const RECOMMANDATION_DATA = [
  {
    title: 'Super profil !',
    firstname: 'Marc',
    lastname: 'Dupont',
    comment: 'Super collaboration ! Je recommande !',
    note: 5,
  },
  {
    title: 'Profil à éviter',
    firstname: 'Jean',
    lastname: 'Dupond',
    comment: 'Mauvaise expérience, à éviter !',
    note: 1,
  }
]

const COMMENT_DATA = [
  {
    comment: 'Parfait !',
    note: 5,
  },
  {
    comment: 'Mauvaise expérience',
    note: 1,
  }
]

const MISSION_DATA = {
  name: 'Prise de photo mannquin',
  description: 'Prendre des photos de mannequin pour un magazine',
  start_date: new Date('2021-01-01'),
  duration: '2h',
  address: '1 rue de Paris',
  document: 'https://my-alfred-data-test.s3.eu-west-3.amazonaws.com/all-inclusive/prod/0a44cfbe-0e87-48b4-8494-62de82d17a4b_svg-3-61.svg',
  customer_location: true,
  foreign_location: false,
  recurrent: 'BOOLEAN_YES',
  frequency: 'MISSION_FREQUENCY_MONTHLY',
  dummy: 0
}

module.exports={
  TI_USER, CUSTOMER_USER, QUOTATION, QUOTATION_DETAIL, USER_DATA, LEAD_DATA, JOB_USER_DATA, RECOMMANDATION_DATA, COMMENT_DATA, MISSION_DATA
}
