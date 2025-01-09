const {
  sendNotification,
  setNotificationsContents,
  setSmsContents,
  setSmsContact,
  addValidationAllowedDomain
} = require('../../utils/mailing')
const { formatDate, formatHour } = require('../../../utils/text')

const SIB_IDS={
  // Firebase notifications
  // SMS
  // CUSTOMERS
  INVITE_USER:3,
}

const SMS_CONTENTS={
}

setSmsContents(SMS_CONTENTS)

const NOTIFICATIONS_CONTENTS={
}

setNotificationsContents(NOTIFICATIONS_CONTENTS)

setSmsContact('Cyberleague')

const sendInvitation = ({user, url}) => {
  return sendNotification({
    notification: SIB_IDS.INVITE_USER,
    destinee: user,
    params: {
      link: url,
    },
  })
}


module.exports = {
  sendInvitation,
}
