const express = require('express')
const {
  getAccessToken,
  getAuthorizationCode,
  getDevices,
  getFreshAccessToken,
  getMeasures,
  subscribe,
} = require('../../utils/withings')
const {
  declareEnumField,
  declareVirtualField,
  setFilterDataUser,
  setPostLogin,
  setPreCreateData,
  setPreprocessGet,
} = require('../../utils/database')
const { isDevelopment, isProduction } = require('../../../config/config')
const lodash = require('lodash')
const moment = require('moment')
const cron = require('node-cron')
const Measure = require('../../models/Measure')
const Appointment = require('../../models/Appointment')
const Reminder = require('../../models/Reminder')
const User = require('../../models/User')
const Device = require('../../models/Device')
const {
  APPOINTMENT_TYPE,
  APPOINTMENT_STATUS,
  GENDER,
  MEASURE_AUTO,
  MEASURE_SOURCE,
  REMINDER_TYPE,
  SMOKER_TYPE,
  WITHINGS_MEASURE_BPM,
  WITHINGS_MEASURE_DIA,
  WITHINGS_MEASURE_SYS,
} = require('./consts')
const { setMeasuresCallback } = require('../../routes/api/withings')

const preCreate = ({ model, params, user }) => {
  if (['measure', 'appointment', 'reminder'].includes(model)) {
    params.user = user
  }
  return Promise.resolve({ model, params })
}

setPreCreateData(preCreate)


const preprocessGet = ({ model, fields, id, user }) => {
  if (model == 'loggedUser') {
    model = 'user'
    id = user?._id || 'INVALIDID'
  }

  return Promise.resolve({ model, fields, id })

}

setPreprocessGet(preprocessGet)

const filterDataUser = ({ model, data, id, user }) => {

  // List mode
  if (['user', 'loggedUser'].includes(model)) {
    return data.map(d => ({
      ...d,
      measures: d.measures && lodash.orderBy(d.measures, ['date'], ['desc']),
      appointments: d.appointments && lodash.orderBy(d.appointments, ['date'], ['asc']),
    }))
  }

  return data
}

setFilterDataUser(filterDataUser)

const USER_MODELS = ['user', 'loggedUser']
USER_MODELS.forEach(m => {
  declareEnumField({ model: m, field: 'gender', enumValues: GENDER })
  declareEnumField({ model: m, field: 'smoker', enumValues: SMOKER_TYPE })
  declareVirtualField({ model: m, field: 'fullname', instance: 'String', requires: 'firstname,lastname' })
  declareVirtualField({
    model: m, field: 'measures', instance: 'Array', requires: '', multiple: true,
    caster: {
      instance: 'ObjectID',
      options: { ref: 'measure' }
    }
  })
  declareVirtualField({
    model: m, field: 'appointments', instance: 'Array', requires: '', multiple: true,
    caster: {
      instance: 'ObjectID',
      options: { ref: 'appointment' }
    }
  })
  declareVirtualField({
    model: m, field: 'reminders', instance: 'Array', requires: '', multiple: true,
    caster: {
      instance: 'ObjectID',
      options: { ref: 'reminder' }
    }
  })
  declareVirtualField({ model: m, field: 'password2', instance: 'String' })
  declareVirtualField({
    model: m, field: 'devices', instance: 'Array', requires: '', multiple: true,
    caster: {
      instance: 'ObjectID',
      options: { ref: 'device' }
    }
  })
  declareVirtualField({ model: m, field: 'tip', instance: 'String' })
  declareVirtualField({ model: m, field: 'missing_attributes', instance: 'String', requires: 'firstname,lastname,height,weight,birthday,gender' })
})


declareVirtualField({ model: 'measure', field: 'recommandation', instance: 'String', requires: 'sys,dia' })
declareVirtualField({ model: 'measure', field: 'source', instance: 'String', requires: 'withings_group', enumValues: MEASURE_SOURCE })

declareEnumField({ model: 'appointment', field: 'type', instance: 'String', enumValues: APPOINTMENT_TYPE })
declareVirtualField({ model: 'appointment', field: 'type_str', instance: 'String', requires: 'type,otherTitle' })
declareVirtualField({ model: 'appointment', field: 'status', instance: 'String', requires: 'date', enumValues: APPOINTMENT_STATUS })

declareEnumField({ model: 'reminder', field: 'type', instance: 'String', enumValues: REMINDER_TYPE })
declareVirtualField({ model: 'reminder', field: 'type_str', instance: 'String', requires: 'type,otherTitle' })
declareVirtualField({ model: 'reminder', field: 'reccurency_str', instance: 'String', requires: 'monday,tuesday,wednesday,thursday,friday,saturday,sunday' })

const updateTokens = user => {
  return getAuthorizationCode(user.email)
    .then(authCode => {
      user.withings_usercode = authCode
      const fn = !user.access_token ? getAccessToken(user.withings_usercode) : getFreshAccessToken(user.refresh_token)
      return fn
        .then(tokens => {
          user.withings_id = tokens.userid
          user.access_token = tokens.access_token
          user.refresh_token = tokens.refresh_token
          user.csrf_token = tokens.csrf_token
          user.expires_at = moment().add(tokens.expires_in, 'seconds')
          user.withings_usercode = null
          return user.save()
        })
        .catch(err => {
          console.error(err)
          return user
        })
    })
    .catch(err => {
      console.error(err)
      return user
    })
}

// Post login: subscribe to withings hook
const postLogin = user => {
  console.log(`Post login ${user}`)
  if (user.withings_id) {
    subscribe(user)
  }
  return user
}

setPostLogin(postLogin)

const router = express.Router()

// Ensure Users tokens are up to date every hour
// TODO It's a quick fix, should not have to request authorization each time
isProduction() && cron.schedule('40 */20 * * * *', () => {
  const expirationMoment = moment().add(40, 'minute')
  return User.find(
    {
      $and: [{ withings_id: { $ne: null } },
      { $or: [{ access_token: null }, { expires_at: { $lte: expirationMoment } }] }
      ]
    }
  )
    .limit(30)
    .sort({ creation_date: -1 })
    .then(users => {
      console.log(`Users requiring token update : ${users.map(u => u.email)}`)
      if (lodash.isEmpty(users)) {
        return null
      }
      return Promise.allSettled(users.map(u => updateTokens(u)))
    })
    .then(res => {
      if (!res) { return }
      const ok = res.filter(r => r.status == 'fulfilled').map(r => r.value.email)
      const nok = res.filter(r => r.status == 'rejected').map(r => r.reason)
      if (!lodash.isEmpty(ok)) {
        console.log(`Updated tokens for ${ok.join(',')}`)
      }
      if (!lodash.isEmpty(nok)) {
        console.error(`Errors:${JSON.stringify(nok)}`)
      }
    })
    .catch(console.error)
})

const getNewMeasures = ({userid, startdate}) => {
  return User.findOne({ withings_id: userid })
    .then(user => {
      if (!user) {
        throw new Error(`No user for withings id ${userid}`)
      }
      console.log(`Getting measures for ${user.email} starting at ${startdate} (${moment.unix(startdate)})`)
      return getMeasures(user.access_token, moment.unix(startdate))
        .then(newMeasures => {
          console.log(`User ${user.email}:got measures ${JSON.stringify(newMeasures)}`)
          if (newMeasures.measuregrps.length > 0) {
            console.log(`User ${user.email}:got ${newMeasures.measuregrps.length} new measures since ${moment.unix(startdate)}`)
          }
          return Promise.all(newMeasures.measuregrps.map(grp => {
            const dekMeasure = {
              user: user._id, date: moment.unix(grp.date), withings_group: grp.grpid,
              sys: grp.measures.find(m => m.type == WITHINGS_MEASURE_SYS)?.value,
              dia: grp.measures.find(m => m.type == WITHINGS_MEASURE_DIA)?.value,
              heartbeat: grp.measures.find(m => m.type == WITHINGS_MEASURE_BPM)?.value,
            }
            return Measure.findOneAndUpdate(
              { withings_group: dekMeasure.withings_group },
              { ...dekMeasure },
              { upsert: true }
            )
          }))
        })
    })
}

setMeasuresCallback(getNewMeasures)

// Get all devices TODO should be notified by Withings
isProduction() && cron.schedule('24 */5 * * * *', async () => {
  console.log(`Getting devices`)
  const users = await User.find({ access_token: { $ne: null } })
    .populate('devices')
    .sort({expires_at: -1})
    .limit(30)
    .lean({ virtuals: true })
  console.log(`Getting devices for ${users.map(u=>u.email)}`)
  return Promise.allSettled(users.map(async user => {
    const devices = await getDevices(user.access_token)
    if (devices.length > 0) {
      console.log(`User ${user.email}: ${devices.length} devices found`)
    }
    const mappedDevices = devices.map(device => ({
      user: user._id,
      ...device,
      last_session_date: moment.unix(device.last_session_date),
    }))
    // First remove all devices
    await Device.deleteMany({ user: user._id }).catch(err => { console.error(err) })
    // Then recreate devices
    await Device.create(mappedDevices).catch(err => { console.error(err) })
  }))
    .then(res => {
      const errors = lodash.zip(res, users)
        .filter(([r]) => r.status == 'rejected')
        .map(([r, u]) => `User ${u.email}: ${r.reason}`)
      errors.length > 0 && console.error(errors)
    })
})

// Send notifications for reminders & apppointments
// Poll every minute
isProduction() && cron.schedule('15 * * * * *', async () => {
  let reminders = await Reminder.find({ active: true }).populate('user')
  reminders = reminders.filter(r => r.shouldNotify())
  if (!lodash.isEmpty(reminders)) {
    console.log(`Remind ${reminders.map(r => `${r.type_str} for ${r.user.email}`)}`)
  }

  let appointments = await Appointment.find().populate('user')
  appointments = appointments.filter(a => a.shouldNotify())

  if (!lodash.isEmpty(appointments)) {
    console.log(`Appointment ${appointments.map(r => `${r.type_str} for ${r.user.email}`)}`)
  }
})


// Poll measures while Withings does not callback
isProduction() && cron.schedule('*/30 * * * * *', async () => {
  console.log(`Polling measures`)
  // Only get users having a device
  const fromDate=moment().add(-1, 'hour')
  return Device.find()
    .then(devices => Promise.allSettled(devices.map(device => getNewMeasures(device.user._id, fromDate)
      .then(console.log)
      .catch(console.error)
    )
    ))
})

module.exports = {
  updateTokens,
  router,
}
