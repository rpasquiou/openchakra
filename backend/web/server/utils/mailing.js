let sendUserNotification=null
try {
  sendUserNotification=require('./firebase').sendUserNotification
}
catch(err) {
 console.warn('Could not get firebase module', err.message)
}
const isValidDomain = require('is-valid-domain')
const {
  getMailProvider,
  isProduction,
  isDevelopment,
} = require('../../config/config')
const lodash=require('lodash')
const {fillSms} = require('../../utils/sms')
const PageTag_ = require('../models/PageTag_')

const mailProvider=getMailProvider()

let smsContact=null

const setSmsContact = contact => {
  smsContact=contact
}

const ALLOWED_VALIDATION_DOMAINS=[
  '@wappizy.com',
]
const addValidationAllowedDomain = domain => {
  if (isDevelopment()) {
    return console.warn(`No extra mailing domain in development mode`)
  }
  if (!isValidDomain(domain)) {
    throw new Error(`Invalid domain:${domain}`)
  }
  ALLOWED_VALIDATION_DOMAINS.push(`@${domain}`)
  console.log('Allowed domains are', ALLOWED_VALIDATION_DOMAINS)
}

const isAllowedEmail = email => {
  if (isDevelopment()) {
    return false
  }
  return isProduction() || ALLOWED_VALIDATION_DOMAINS.some(domain => email.endsWith(domain))
}

const mailHandlers=lodash(mailProvider).split(',')
  .map(provider => provider=='brevo' ? 'sendInBlue' : provider)
  .map(m => [m, require(`./${m}`)])
  .fromPairs()
  .value()

console.log('***** Mail Handlers:', Object.keys(mailHandlers))

const MAIL_HANDLER={
  sendMail: (...params) => Promise.allSettled(Object.values(mailHandlers).map(m => m.sendMail(...params))).then(console.log),
  sendSms: (...params) => Promise.allSettled(Object.values(mailHandlers).map(m => m.sendSms(...params, smsContact))).then(console.log),
  sendNotification: sendUserNotification,
}

let SMS_CONTENTS = {}

const setSmsContents = data => {
  SMS_CONTENTS = data
}

let NOTIFICATIONS_CONTENTS = {}

const setNotificationsContents = data => {
  NOTIFICATIONS_CONTENTS = data
}

const sendNotification = ({notification, destinee, ccs, params, attachment}) => {

  /** TEST purpose */

  let enable_mails = isAllowedEmail(destinee.email)
  let enable_sms = isAllowedEmail(destinee.email)
  let enable_notifications = isAllowedEmail(destinee.email)

  const prefix=(!enable_sms && !enable_mails && !enable_notifications) ? '***** DISABLED:':''
  console.log(`${prefix}send notification #${notification} to ${destinee.email} with params ${JSON.stringify(params)}`)

  if (!enable_sms && !enable_mails) {
    return Promise.resolve(true)
  }

  let resultMail = true, resultSms = true

  if (enable_mails) {
    resultMail = MAIL_HANDLER.sendMail({index:notification, email:destinee.email, ccs, data:params, attachment})
  }

  // Send SMS
  if (enable_sms && destinee.phone && SMS_CONTENTS[notification.toString()]) {
    const smsContents = fillSms(SMS_CONTENTS[notification.toString()], params)
    if (!smsContents) {
      console.error(`Error creating SMS ${notification} to ${destinee.phone} with params ${JSON.stringify(params)}`)
      result = false
    }
    else {
      resultSms = MAIL_HANDLER.sendSms(destinee.phone, smsContents)
    }
  }

  // Send Notification
  if (enable_notifications && destinee._id && NOTIFICATIONS_CONTENTS[notification.toString()]) {
    const notif=NOTIFICATIONS_CONTENTS[notification.toString()]
    const notifMessage = fillSms(notif.message, params)
    if (!notifMessage) {
      console.error(`Error creating notification ${notification} to ${destinee.phone} with params ${JSON.stringify(params)}`)
      result = false
    }
    else {
      if (!sendUserNotification) {
        console.error(`No firebase plugin available, check server starupt warnings`)
        return false
      }
      resultSms = sendUserNotification({user: destinee, title:notif.title, message: notifMessage}).catch(console.error)
    }
  }

  return Promise.resolve(resultMail)
}

const getTagUrl = async tag => {
  const tagUrl=await PageTag_.findOne({tag})
  if (!tagUrl) {
    throw new Error(`Not tag ${tag} found`)
  }
  return tagUrl.url
}

module.exports = {
  sendNotification,
  setSmsContents,
  setNotificationsContents,
  setSmsContact,
  getTagUrl,
  addValidationAllowedDomain,
}
