const mongoose=require('mongoose')
const moment=require('moment')
const lodash=require('lodash')
const { loadFromDb } = require('../../utils/database')
const { ROLE_FORMATEUR, ROLE_APPRENANT } = require('./consts')
const Group = require('../../models/Group')
const User = require('../../models/User')
const Session = require('../../models/Session')

const getGroupVisiosDays = async (userId, params, data, fields, actualLogged) => {
  const VISIOS_FILTER = /visios\./
  const VISIOS_FILTER2 = /\.visios/
  fields=fields.filter(f => VISIOS_FILTER.test(f)).map(f => f.replace(VISIOS_FILTER, ''))
  params=lodash(params)
    .pickBy((_, f) => VISIOS_FILTER2.test(f))
    .mapKeys((_, f) => f.replace(VISIOS_FILTER2, ''))
    .value()
  params={'filter._owner': data._id}
  const visios=await loadFromDb({model: 'visio', fields, user: userId, params, skipRetain: true})
  const grouped=lodash(visios)
    .groupBy(v => !!v.start_date ? moment(v.start_date).startOf('day') : null)
    .entries()
    .map(([day, visios]) => new mongoose.models.visioDay({day, visios:visios.map(v => new mongoose.models.visio(v))}))
    .value()
  return grouped
}

/**
 * My visios are the one whose:
 *  - creator is me (trainer)
 *  - _owner is me (trainee for cocahing)
 *  - _owner is any group my session belongs to
 */
const getUserVisiosDays = async (userId, params, data, fields, actualLogged) => {
  const VISIOS_FILTER = /visios\./
  const VISIOS_FILTER2 = /\.visios/
  fields=fields.filter(f => VISIOS_FILTER.test(f)).map(f => f.replace(VISIOS_FILTER, ''))
  params=lodash(params)
    .pickBy((_, f) => VISIOS_FILTER2.test(f))
    .mapKeys((_, f) => f.replace(VISIOS_FILTER2, ''))
    .value()
  const role=(await User.findById(userId)).role
  const _owner=[]
  if (role==ROLE_APPRENANT) {
    _owner.push(userId)
  }
  const mySessions=await Session.find({trainees: userId}, {_id:1})
  const myGroups=await Group.find({sessions: {$in: mySessions}}, {_id:1})
  _owner.push(...myGroups)
  params={'filter._owner': _owner}
  if (role==ROLE_FORMATEUR) {
    params['filter.creator']=userId
  }
  console.log('params', params)
  const visios=await loadFromDb({model: 'visio', fields, user: userId, params, skipRetain: true})
  const grouped=lodash(visios)
    .groupBy(v => !!v.start_date ? moment(v.start_date).startOf('day') : null)
    .entries()
    .map(([day, visios]) => new mongoose.models.visioDay({day, visios:visios.map(v => new mongoose.models.visio(v))}))
    .value()
  return grouped
}

module.exports={
  getGroupVisiosDays, getUserVisiosDays,
}