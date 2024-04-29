const { ROLE_CUSTOMER } = require("../../../server/plugins/sosynpl/consts");

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

module.exports={
  CUSTOMER_DATA,
}
