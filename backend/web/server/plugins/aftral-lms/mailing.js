const {
  sendNotification,
  setNotificationsContents,
  setSmsContact,
  addValidationAllowedDomain,
} = require('../../utils/mailing')
const { formatDate, formatHour, formatDateTime } = require('../../../utils/text')

const SIB_IDS={
  SEND_PASSWORD: 5,
  TRAINEE_REGISTER: 6,
  TRAINER_REGISTER: 7,
  ADMIN_IMPORT: 8,
  CERTIFICATE: 10,
}

const NOTIFICATIONS_CONTENTS={

}

setNotificationsContents(NOTIFICATIONS_CONTENTS)

setSmsContact('Aftral')

addValidationAllowedDomain('aftral.com')
addValidationAllowedDomain('gmail.com')


// Send regiter info to trainer
const sendInitTrainer = async ({trainer}) => {
  return sendNotification({
    notification: SIB_IDS.TRAINER_REGISTER,
    destinee: trainer,
    params: {
      firstname: trainer.firstname,
      email: trainer.email,
      plain_password: trainer.plain_password,
    },
  })
}

// Send regiter info to trainee
const sendInitTrainee = async ({trainee, session}) => {
  return sendNotification({
    notification: SIB_IDS.TRAINEE_REGISTER,
    destinee: trainee,
    params: {
      firstname: trainee.firstname,
      program_name: session.name,
      start_date: formatDate(session.start_date),
      end_date: formatDate(session.end_date),
      site_name: session.location,
      email: trainee.email,
      plain_password: trainee.plain_password,
    },
  })
}

// Send FTP import errors to admins
const sendImportError = async ({admin, date, message}) => {
  return sendNotification({
    notification: SIB_IDS.ADMIN_IMPORT,
    destinee: admin,
    params: {
      firstname: admin.firstname,
      date: `${formatDate(date)} à ${formatHour(date)}`,
      message,
    },
  })
}

// Send FTP import errors to admins
const sendForgotPassword = async ({user}) => {
  return sendNotification({
    notification: SIB_IDS.SEND_PASSWORD,
    destinee: user,
    params: {
      login: user.email,
      password: user.plain_password,
    },
  })
}

const sendCertificate = async ({user, session, attachment_name, attachment_url, attachment_type}) => {
  return sendNotification({
    notification: SIB_IDS.CERTIFICATE,
    destinee: user,
    params: {
      firstname: user.firstname,
      program_name: session.name,
      start_date: formatDate(session.start_date),
      end_date: formatDate(session.end_date),
      location: session.location,
    },
    attachment: {
      name: attachment_name,
      url: attachment_url,
      type: attachment_type,
    }
  })
}


module.exports = {
  sendImportError, sendInitTrainee, sendInitTrainer, sendForgotPassword, sendCertificate,
}
