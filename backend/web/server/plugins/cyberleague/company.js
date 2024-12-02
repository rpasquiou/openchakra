const Company = require('../../models/Company')
const Content = require('../../models/Content')
const Advertising = require('../../models/Advertising')
const Document = require('../../models/Document')
const { CURRENT_ADVERTISING_NO, CURRENT_ADVERTISING_YES } = require('./consts')
const { loadFromDb } = require('../../utils/database')
const User = require('../../models/User')
const ExpertiseSet = require('../../models/ExpertiseSet')

const getContents = async (userId, params, data, fields) => {
  const contentsWithoutFields = await Content.find({creator: {$in: data.users.map(u => u._id)}})

  const contents = await loadFromDb({
    model: 'content',
    user: userId,
    fields,
    params: {...params, 'filter._id':{$in: contentsWithoutFields.map(u => u._id)}}
  })
  
  return contents.map(c => new Content({
    ...c, 
    creator: new User(c.creator),
    expertise_set: new ExpertiseSet(c.expertise_set)
  }))
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

const setterCurrentAdvertising = async ({ id, attribute, value, user }) => {
  if (value == CURRENT_ADVERTISING_NO) {
    return Company.updateMany({current_advertising: id}, {current_advertising: null})
  } else {
    const ad = await Advertising.findById(id)
    return Company.findByIdAndUpdate(ad.company, {current_advertising: id})
  }
}

const getterCurrentAdvertising = async (userId, params, data) => {
  const isCurrent = await Company.exists({_id: data.company, current_advertising: data._id})
  return isCurrent ? CURRENT_ADVERTISING_YES : CURRENT_ADVERTISING_NO
}

const getterDocuments = async (userId, params, data) => {
  const docs = await Document.find({$or: [{company: data._id}, {company: {$exists: false}}]})
  return docs
}


module.exports = { 
  getContents,
  getterStatus,
  getterIsCurrentAdvertising,
  setterIscurrentAdvertising,
  setterCurrentAdvertising,
  getterCurrentAdvertising,
  getterDocuments,
 }