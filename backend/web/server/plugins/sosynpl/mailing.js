const {
  sendNotification,
  setNotificationsContents,
  setSmsContents,
  setSmsContact,
  getTagUrl,
  addValidationAllowedDomain
} = require('../../utils/mailing')
const { computeUrl } = require('../../../config/config')

const SIB_IDS={
  CUSTOMER_CONFIRM_EMAIL: 1,
  FREELANCE_CONFIRM_EMAIL: 2,
  FORGOT_PASSWORD: 4,
  ASK_RECOMMANDATION: 26,
  FREELANCE_SEND_SUGGESTION: 31,
  CUSTOMER_SEND_APPLICATION: 39,
  NEW_CONTACT: 47,
}

const SMS_CONTENTS={
}

setSmsContents(SMS_CONTENTS)

const NOTIFICATIONS_CONTENTS={
}

setNotificationsContents(NOTIFICATIONS_CONTENTS)

setSmsContact('SoSynpL')

addValidationAllowedDomain('sosynpl.com')
addValidationAllowedDomain('yelowi.com')

const sendCustomerConfirmEmail = async ({user}) => {
  const tagUrl=await getTagUrl('EMAIL_VALIDATION')
  const email_validation_url=`${computeUrl(tagUrl)}?id=${user._id}`
  return sendNotification({
    notification: SIB_IDS.CUSTOMER_CONFIRM_EMAIL,
    destinee: user,
    params: {
      firstname: user.firstname,
      email_validation_url,
    },
  })
}

const sendFreelanceConfirmEmail = async ({user}) => {
  const tagUrl=await getTagUrl('EMAIL_VALIDATION')
  const email_validation_url=`${computeUrl(tagUrl)}?id=${user._id}`
  return sendNotification({
    notification: SIB_IDS.FREELANCE_CONFIRM_EMAIL,
    destinee: user,
    params: {
      firstname: user.firstname,
      email_validation_url,
    },
  })
}

// Send suggestion of 'announce'to 'user'
const sendSuggestion2Freelance = async ({user, announce}) => {
  const announceUrl=`${await getTagUrl('ANNOUNCE')}?id=${announce._id}`
  return sendNotification({
    notification: SIB_IDS.FREELANCE_SEND_SUGGESTION,
    destinee: user,
    params: {
      firstname: user.firstname,
      title: announce.title,
      url: announceUrl,
    },
  })
}

// Send suggestion of 'announce'to 'user'
const sendApplication2Customer = async ({freelance, announce, customer}) => {
  return sendNotification({
    notification: SIB_IDS.CUSTOMER_SEND_APPLICATION,
    destinee: customer,
    params: {
      firstname: freelance.firstname,
      annonce_name: announce.title,
    },
  })
}

// Send contact info to admins
const sendNewContact2Admin = async ({contact, admin}) => {
  return sendNotification({
    notification: SIB_IDS.NEW_CONTACT,
    destinee: admin,
    params: {
      ...contact,
    },
  })
}

// Send contact info to admins
const sendForgotPassword = async ({user, password}) => {
  return sendNotification({
    notification: SIB_IDS.FORGOT_PASSWORD,
    destinee: user,
    params: {
      firstname: user.firstname,
      temporary_password: password,
    },
  })
}

// Send contact info to admins
const sendAskRecommandation = async ({user, external_email, external_firstname, message, recommendation_id}) => {
  const recommendationTag=await getTagUrl('RECOMMENDATION')
  const recommendationUrl=`${computeUrl(recommendationTag)}?id=${recommendation_id}`
  return sendNotification({
    notification: SIB_IDS.ASK_RECOMMANDATION,
    destinee: {email: external_email},
    params: {
      firstname: user.firstname,
      external_firstname,
      recommendation_url: recommendationUrl,
      message,
    },
  })
}


module.exports = {
  sendCustomerConfirmEmail, sendFreelanceConfirmEmail, sendSuggestion2Freelance, sendApplication2Customer,
  sendNewContact2Admin, sendForgotPassword, sendAskRecommandation,
}
