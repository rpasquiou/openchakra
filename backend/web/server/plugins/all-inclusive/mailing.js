const { sendNotification, setSmsContents } = require('../../utils/mailing')
const JSSoup = require('jssoup').default
const {datetime_str} = require('../../../utils/dateutils')

const SIB_IDS={
  TI_PROFILE_ONLINE: 12,
  ASK_RECOMMANDATION: 15,
  FORGOT_PASSWORD: 20,
  ASK_CONTACT: 33,
  CUSTOMER_QUOTATION_SENT_2_CUSTOMER: 36,
  TIPI_ACCOUNT_CREATED: 37,
  CUSTOMER_ACCOUNT_CREATED: 38,
  ACCOUNT_DEACTIVED: 45,
  ADMIN_ACCOUNT_CREATED: 63,
  TIPI_SEARCH: 65,
}

const SMS_CONTENTS={
  [SIB_IDS.CUSTOMER_QUOTATION_SENT_2_CUSTOMER]: 'Bonjour, {{params.user_full_name}} vous soumet un devis',
}

setSmsContents(SMS_CONTENTS)

// #20
const sendForgotPassword = ({user, password}) => {
  return sendNotification({
    notification: SIB_IDS.FORGOT_PASSWORD,
    destinee: user,
    params: {
      user_firstname: user.firstname,
      login: user.email,
      password: password,
    }
  })
}

// #36
const sendQuotationSentToCustomer = ({quotation}) => {
  return sendNotification({
    notification: SIB_IDS.CUSTOMER_QUOTATION_SENT_2_CUSTOMER,
    destinee: {email: quotation.email},
    params: {
      user_full_name: quotation.mission.job.user.full_name,
      customer_firstname: quotation.firstname,
      message: quotation.description,
    }
  })
}

// #37
const sendAccountCreatedToTIPI = ({user}) => {
  return sendNotification({
    notification: SIB_IDS.TIPI_ACCOUNT_CREATED,
    destinee: user,
    params: {
      user_firstname: user.firstname,
    }
  })
}

// #38
const sendAccountCreatedToCustomer = ({user}) => {
  return sendNotification({
    notification: SIB_IDS.CUSTOMER_ACCOUNT_CREATED,
    destinee: user,
    params: {
      user_firstname: user.firstname,
    }
  })
}

const sendAskContact = ({user, fields, attachment}) => {
  return sendNotification({
    notification: SIB_IDS.ASK_CONTACT,
    destinee: user,
    params: {
      ...fields
    },
    attachment
  })
}

const sendAccountCreatedToAdmin = ({user, password}) => {
  return sendNotification({
    notification: SIB_IDS.ADMIN_ACCOUNT_CREATED,
    destinee: user,
    params: {
      user_firstname: user.firstname,
      login: user.email,
      password: password,
    }
  })
}

const sendAccountDeactivated = ({user}) => {
  return sendNotification({
    notification: SIB_IDS.ACCOUNT_DEACTIVED,
    destinee: user,
    params: {
      user_firstname: user.firstname,
    }
  })
}

// Send email to destinee_email asking recommandation for user using URL
const sendAskRecomandation = ({user, destinee_email, message, url}) => {
  return sendNotification({
    notification: SIB_IDS.ASK_RECOMMANDATION,
    destinee: {email: destinee_email},
    params: {
      user_full_name: user.full_name,
      message,
      url,
    }
  })
}

// Send email to TIPI asking for TI search
const sendTipiSearch = ({admin, mission}) => {
  const mission_description_txt=new JSSoup(mission.description||'<html></html>').text
  return sendNotification({
    notification: SIB_IDS.TIPI_SEARCH,
    destinee: admin,
    params: {
      ...mission.user,
      ...mission,
      location: mission.location_str,
      message:  mission_description_txt,
    }
  })
}

// Sent to customer when quotation is not accepted after 48h
const sendPendingQuotation = (mission) => {
  return sendNotification({
    notification: SIB_IDS.PENDING_QUOTATION,
    destinee: mission.user,
    params: {
      customer_firstname: mission.user.firstname,
      user_firstname: mission.job.user.firstname,
      mission_name: mission.name,
      mission_description: mission.description,
    },
  })
}

const sendNewMessage = user => {
  return sendNotification({
    notification: SIB_IDS.NEW_MESSAGE,
    destinee: user,
    params: {
      user_firstname: user.firstname,
    },
  })
}

// Requires: job.user, user.full_name
const sendNewMission = mission => {
  return sendNotification({
    notification: SIB_IDS.NEW_MISSION_ASKED_2_TIPI,
    destinee: mission.job.user,
    params: {
      user_firstname: mission.job.user.firstname,
      customer_company_name: mission.user.company_name,
      customer_full_name: mission.user.full_name,
      mission_name: mission.name,
      mission_description: new JSSoup(mission.description||'<html></html>').text,
      start_date: moment(mission.start_date).format('DD/MM/YY'),
    },
  })
}

// TIPI => no quotation after 2 days
const sendMissionAskedReminder = mission => {
  return sendNotification({
    notification: SIB_IDS.MISSION_AKED_REMINDER,
    destinee: mission.job.user,
    params: {
      customer_company_name: mission.user.company_name,
      user_first_name: mission.job.user.firstname,
      mission_name: mission.name,
    },
  })
}

const sendMissionAskedSummary = mission => {
  return sendNotification({
    notification: SIB_IDS.MISSION_ASKED_SUMMARY,
    destinee: mission.user,
    params: {
      customer_firstname: mission.user.firstname,
      user_firstname: mission.job.user.firstname,
      mission_name: mission.name,
      mission_description: new JSSoup(mission.description||'<html></html>').text,
      mission_creation_date: moment(mission[CREATED_AT_ATTRIBUTE]).format('DD/MM/YY'),
    },
  })
}

const sendMissionRefused = mission => {
  return sendNotification({
    notification: SIB_IDS.REFUSED_MISSION,
    destinee: mission.user,
    params: {
      customer_firstname: mission.user.firstname,
      user_firstname: mission.job.user.firstname,
      mission_name: mission.name,
    },
  })
}

const sendQuotationRefused = mission => {
  return sendNotification({
    notification: SIB_IDS.REFUSED_QUOTATION,
    destinee: mission.job.user,
    params: {
      user_firstname: mission.job.user.firstname,
      customer_company_name: mission.user.company_name,
    },
  })
}

const sendQuotationAccepted = mission => {
  return sendNotification({
    notification: SIB_IDS.ACCEPTED_QUOTATION,
    destinee: mission.job.user,
    params: {
      user_firstname: mission.job.user.firstname,
      customer_company_name: mission.user.company_name,
    },
  })
}

const sendLeaveComment = mission => {
  return sendNotification({
    notification: SIB_IDS.LEAVE_COMMENT,
    destinee: mission.user,
    params: {
      user_firstname: mission.job.user.firstname,
      customer_firstname: mission.user.firstname,
      mission_name: mission.name,
    },
  })
}

const sendMissionsFinished = mission => {
  return sendNotification({
    notification: SIB_IDS.FINISHED_MISSION,
    destinee: mission.user,
    params: {
      customer_firstname: mission.user.firstname,
      user_firstname: mission.job.user.firstname,
      mission_name: mission.name,
    },
  })
}

// => TIPI
const sendCommentReceived = mission => {
  return sendNotification({
    notification: SIB_IDS.COMMENT_RECEIVED,
    destinee: mission.job.user,
    params: {
      customer_company_name: mission.user.company_name,
      user_firstname: mission.job.user.firstname,
      mission_name: mission.name,
    },
  })
}

// => TIPI
const  sendBillingReminder = mission => {
  return sendNotification({
    notification: SIB_IDS.SEND_BILL_REMINDER,
    destinee: mission.job.user,
    params: {
      customer_company_name: mission.user.company_name,
      user_firstname: mission.job.user.firstname,
      mission_name: mission.name,
    },
  })
}

// => CUSTOMER
const  sendBillSent = mission => {
  return sendNotification({
    notification: SIB_IDS.BILL_SENT,
    destinee: mission.user,
    params: {
      customer_firstname: mission.user.firstname,
      user_firstname: mission.job.user.firstname,
      mission_name: mission.name,
    },
  })
}

// => TI
const  sendBillRefused = mission => {
  return sendNotification({
    notification: SIB_IDS.BILL_REFUSED,
    destinee: mission.job.user,
    params: {
      user_firstname: mission.job.user.firstname,
      customer_company_name: mission.user.company_name,
      mission_name: mission.name,
    },
  })
}

// => ALLE
const sendCompanyRegistered = (account, destinee) => {
  return sendNotification({
    notification: SIB_IDS.COMPANY_REGISTERED,
    destinee: destinee,
    params: {
      company_name: account.company_name,
      zip_code: account.zip_code,
    },
  })
}

// => CUSTOMER
const sendMissionReminderCustomer = mission => {
  return sendNotification({
    notification: SIB_IDS.MISSION_REMINDER_CUSTOMER,
    destinee: mission.user,
    params: {
      mission_name: mission.name,
      start_date: moment(mission.start_date).format('DD/MM/YY'),
      user_full_name: mission.job.user.full_name,
      location_str: mission.address,
      customer_firstname: mission.user.firstname,
    },
  })
}

// => TI
const sendMissionReminderTI = mission => {
  return sendNotification({
    notification: SIB_IDS.MISSION_REMINDER_TI,
    destinee: mission.job.user,
    params: {
      user_firstname: mission.job.user.firstname,
      mission_name: mission.name,
      customer_company_name: mission.user.company_name,
      start_date: moment(mission.start_date).format('DD/MM/YY'),
      location_str: mission.address,
    },
  })
}

// => TI
const sendProfileOnline = user => {
  return sendNotification({
    notification: SIB_IDS.TI_PROFILE_ONLINE,
    destinee: user,
    params: {
      user_firstname: user.firstname,
    },
  })
}

module.exports = {
  sendQuotationSentToCustomer,
  sendAccountCreatedToTIPI,
  sendAccountCreatedToCustomer,
  sendForgotPassword,
  sendAskContact,
  sendAccountCreatedToAdmin,
  sendAccountDeactivated,
  sendAskRecomandation,
  sendTipiSearch,
  sendPendingQuotation,
  sendNewMessage,
  sendNewMission,
  sendMissionAskedReminder,
  sendMissionAskedSummary,
  sendMissionRefused,
  sendQuotationRefused,
  sendQuotationAccepted,
  sendLeaveComment,
  sendMissionsFinished,
  sendCommentReceived,
  sendBillingReminder,
  sendBillSent,
  sendBillRefused,
  sendCompanyRegistered,
  sendMissionReminderCustomer,
  sendMissionReminderTI,
  sendProfileOnline,
}
