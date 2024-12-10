const Company = require('../../models/Company')

const getterPartnerList = async () => {
  const list = await Company.find({statut: {$exists: true}})
  return list
}

module.exports = {
  getterPartnerList,
}