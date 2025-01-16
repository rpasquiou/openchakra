const { sendNotification, getTagUrl, addValidationAllowedDomain } = require('../../utils/mailing')
const { RESET_TOKEN_VALIDITY, USERTICKET_STATUSES } = require('./consts')
const { computeUrl } = require('../../../config/config')

const SIB_IDS = {
  RESET_PASSWORD: 1,
  EVENT_REGISTRATION: 3,
  EVENT_REGISTRATION_WAITING_LIST: 5,
}

addValidationAllowedDomain('plateforme.entreprisedufutur.com')

const sendResetPassword = async ({ user, duration, token }) => {
  const tagUrl = await getTagUrl('RESET_PASSWORD')
  const resetPasswordUrl = `${computeUrl(tagUrl)}?id=${token}`
  return sendNotification({
    notification: SIB_IDS.RESET_PASSWORD,
    destinee: user,
    params: {
      firstname: user.firstname,
      duration: RESET_TOKEN_VALIDITY,
      reset_url: resetPasswordUrl,
    },
  })
}

const sendEventRegistration = async ({ user, ticketStatus, eventName, admin }) => {
  return sendNotification({
    notification: SIB_IDS.EVENT_REGISTRATION,
    destinee: admin,
    params: {
      firstname: admin.firstname,
      user_ticket_status: USERTICKET_STATUSES[ticketStatus],
      user_ticket_fullname: `${user.firstname} ${user.lastname}`,
      event_name: eventName,
    },
  })
}

const sendEventRegistrationWaitingList = async ({ user, eventName }) => {
  return sendNotification({
    notification: SIB_IDS.EVENT_REGISTRATION_WAITING_LIST,
    destinee: user,
    params: {
      firstname: user.firstname,
      event_name: eventName,
    },
  })
}

module.exports = {
  sendResetPassword,
  sendEventRegistration,
  sendEventRegistrationWaitingList,
}