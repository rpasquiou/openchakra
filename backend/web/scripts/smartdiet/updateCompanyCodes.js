const mongoose = require("mongoose")
const lodash = require("lodash")
const Company = require("../../server/models/Company")
const User = require("../../server/models/User")
const Lead = require("../../server/models/Lead")
const { getDatabaseUri } = require("../../config/config")
const { MONGOOSE_OPTIONS } = require("../../server/utils/database")

const CODES={
}

const getAllCodes = async () => {
  const c1=await Company.distinct('code')
  const c2=await User.distinct('company_code')
  const c3=await Lead.distinct('company_code')
  return lodash([...c1, ...c2, ...c3]).filter(Boolean).map(c => c.toUpperCase()).uniq().sort().join(',')
}
mongoose.connect(getDatabaseUri(), MONGOOSE_OPTIONS)
  .then(async () => {
    console.log('Mapping codes', CODES)
    console.log('Codes before', await getAllCodes())
    await Promise.all(Object.entries(CODES).map(async ([oldCode, newCode]) => {
      console.log(oldCode, newCode)
      console.log(oldCode, 'company', await Company.updateMany({code: oldCode}, {code: newCode}))
      console.log(oldCode, 'user', await User.updateMany({company_code: oldCode}, {company_code: newCode}))
      console.log(oldCode, 'lead', await Lead.updateMany({company_code: oldCode}, {company_code: newCode}))
    }))
    console.log('Codes after', await getAllCodes())
  })
  .finally(process.exit)