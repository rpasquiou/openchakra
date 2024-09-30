const {
  sendNotification,
  setNotificationsContents,
  setSmsContact,
  addValidationAllowedDomain,
} = require('../../utils/mailing')
const { formatDate, formatHour, formatDateTime } = require('../../../utils/text')

const SIB_IDS={
  ADMIN_IMPORT: 8,
}

const NOTIFICATIONS_CONTENTS={

}

setNotificationsContents(NOTIFICATIONS_CONTENTS)

setSmsContact('Aftral')

addValidationAllowedDomain('aftral.com')

// Send suggestion of 'announce'to 'user'
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
  sendImportError,
}
