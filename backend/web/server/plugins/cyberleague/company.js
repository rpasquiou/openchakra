const Company = require('../../models/Company')
const Content = require('../../models/Content')

const getContents = async (userId, params, data) => {
  const contents = await Content.find({creator: data.users})
  return contents
}

const getterStatus = ({field, value}) => {
  return async (userId, params, data) => {
    const companies = Company.find({[field]: value})
    return companies.map((c) => {return c._id})
  }
}

module.exports = { 
  getContents,
  getterStatus
 }