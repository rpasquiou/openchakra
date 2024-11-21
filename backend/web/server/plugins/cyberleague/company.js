const Company = require('../../models/Company')
const Content = require('../../models/Content')
const Advertising = require('../../models/Advertising')

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

const getterIsCurrentAdvertising = async (userId, params, data) => {
  const isCurrent = await Company.exists({_id: data.company, current_advertising: data._id})
  return isCurrent
}

const setterIscurrentAdvertising = async ({ id, attribute, value, user }) => {
  if (!value) {
    return Company.updateMany({current_advertising: id}, {current_advertising: null})
  } else {
    const ad = await Advertising.findById(id)
    return Company.findByIdAndUpdate(ad.company, {current_advertising: id})
  }
}

module.exports = { 
  getContents,
  getterStatus,
  getterIsCurrentAdvertising,
  setterIscurrentAdvertising,
 }