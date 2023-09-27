const { GENDER } = require('../../server/plugins/dekuple/consts')
const moment = require('moment')
require('moment/locale/fr')

moment.locale('fr')
const mongoose = require('mongoose')
const { getDataModel, getDatabaseUri } = require('../../config/config')
const { MONGOOSE_OPTIONS } = require('../../server/utils/database')
const Measure=require('../../server/models/Measure')
require('../../server/models/User')

const formatDateTime = date => {
  return moment(date).format('DD/MM/YYYY HH:mm')
}

const formatDate = date => {
  return moment(date).format('DD/MM/YYYY')
}

mongoose.connect(getDatabaseUri(), MONGOOSE_OPTIONS)
  .then(() => Measure.find({}).populate('user').sort({date:1}))
  .then(measures => {
    const res=measures
      .filter(m => !/@wappizy/.test(m.user.email))
      .map(m => {
      return `${formatDate(m.date)};${m.sys};${m.dia};${m.heartbeat};${m.user.fullname};${m.user.email};${formatDate(m.user.birthday)};${m.user.phone}`
    })
    console.log(`date;sys;dia;heartbeat;user;email;birthday;phone`)
    console.log(res.join('\n'))
  })
  .catch(console.error)
  .finally(() => process.exit(0))
