const CUSTOMER_REQUIRED_ATTRIBUTES = ['firstname','lastname','position','phone','mail','password','siren','company_name']
const CUSTOMER_ANNOUNCE_ATTRIBUTES = ['company_logo','sector','description','company_size']
const CUSTOMER_CONTRACT_ATTRIBUTES = ['legal_status','registration_city','social_capital','headquarter_address','billing_contact_address','billing_contact_firstname','billing_contract_lastname','billing_contact_email']

const customerProfileCompletion = (user) => {
  if (!user['customer_missing_attributes'] || user['customer_missing_attributes'].length === 0) return 1
  const attrCount = [...CUSTOMER_ANNOUNCE_ATTRIBUTES, ...CUSTOMER_CONTRACT_ATTRIBUTES, ...CUSTOMER_REQUIRED_ATTRIBUTES].length
  const missingCount = user['customer_missing_attributes'].length
  return Math.floor(1-missingCount/attrCount)
}

const customerMissingAttributes = (user) => {
  let missingAttr = []
  let i=0;
  [...CUSTOMER_REQUIRED_ATTRIBUTES, ...CUSTOMER_ANNOUNCE_ATTRIBUTES, ...CUSTOMER_CONTRACT_ATTRIBUTES].forEach(attr => {
    if (!user[attr]) missingAttr = [...missingAttr, attr]
  })
  return missingAttr
}

module.exports = { customerMissingAttributes, customerProfileCompletion, CUSTOMER_REQUIRED_ATTRIBUTES, CUSTOMER_ANNOUNCE_ATTRIBUTES, CUSTOMER_CONTRACT_ATTRIBUTES }
