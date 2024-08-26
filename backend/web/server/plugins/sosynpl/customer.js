const { CUSTOMER_REQUIRED_ATTRIBUTES, CUSTOMER_OUTPUT_ATTRIBUTES } = require("./consts")


const customerProfileCompletion = (user) => {
  if (!user['customer_missing_attributes'] || user['customer_missing_attributes'].length === 0) return 1
  const attrCount = CUSTOMER_REQUIRED_ATTRIBUTES.length
  const missingCount = user['customer_missing_attributes'].length
  return Math.floor(100-missingCount/attrCount*100)/100
}

const customerMissingAttributes = (user) => {
  let missingAttr = []
  const allAttributes = [...CUSTOMER_REQUIRED_ATTRIBUTES]
  allAttributes.forEach((attr, index) => {
    if (!user[attr]) {
      const attributeString = index === allAttributes.length - 1 ? CUSTOMER_OUTPUT_ATTRIBUTES[attr] : `${CUSTOMER_OUTPUT_ATTRIBUTES[attr]} `
      missingAttr = [...missingAttr, attributeString]
    }
  })
  return missingAttr
}

module.exports = { customerMissingAttributes, customerProfileCompletion }
