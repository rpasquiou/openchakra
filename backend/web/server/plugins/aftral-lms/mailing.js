const {
  sendNotification,
  setNotificationsContents,
  setSmsContact,
  addValidationAllowedDomain,
} = require('../../utils/mailing')
const { formatDate, formatHour, formatDateTime } = require('../../../utils/text')

const SIB_IDS={
  TRAINEE_REGISTER: 6,
  ADMIN_IMPORT: 8,
}

const NOTIFICATIONS_CONTENTS={

}

setNotificationsContents(NOTIFICATIONS_CONTENTS)

setSmsContact('Aftral')

addValidationAllowedDomain('aftral.com')
addValidationAllowedDomain('gmail.com')


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


module.exports = {
  sendImportError, sendInitTrainee,
}
