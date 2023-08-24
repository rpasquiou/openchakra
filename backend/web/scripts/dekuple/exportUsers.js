const { GENDER } = require('../../server/plugins/dekuple/consts')
const moment = require('moment')
require('moment/locale/fr')

moment.locale('fr')
const mongoose = require('mongoose')
const { getDataModel, getDatabaseUri } = require('../../config/config')
const { MONGOOSE_OPTIONS } = require('../../server/utils/database')
const User=require('../../server/models/User')

const formatDateTime = date => {
  return moment(date).format('DD/MM/YYYY HH:mm')
}

const formatDate = date => {
  return moment(date).format('DD/MM/YYYY')
}

mongoose.connect(getDatabaseUri(), MONGOOSE_OPTIONS)
  .then(() => User.find({}, 'creation_date firstname lastname email phone gender birthday active'))
  .then(users => {
    const res=users.map(m => {
      return `${formatDate(m.creation_date)};${m.firstname};${m.lastname};${m.email};${m.phone};${GENDER[m.gender]};${formatDate(m.birthday)};${m.active}`
    })
    console.log(`Creation;firstname;lastname;email;phone;gender;birthday;active`)
    console.log(res.join('\n'))
    process.exit(0)
  })
  .catch(err => {
     console.error(err)
     process.exit(1)
  })
