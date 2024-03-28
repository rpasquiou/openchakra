const {
  sendNotification,
  setNotificationsContents,
  setSmsContents,
  setSmsContact
} = require('../../utils/mailing')
const {datetime_str} = require('../../../utils/dateutils')
const moment=require('moment')
const { formatDate, formatHour } = require('../../../utils/text')
const { generateIcs } = require('../../../utils/ics')

const SIB_IDS={
  CUSTOMER_CONFIRM_EMAIL:1,
}

const SMS_CONTENTS={
}

setSmsContents(SMS_CONTENTS)

const NOTIFICATIONS_CONTENTS={
}

setNotificationsContents(NOTIFICATIONS_CONTENTS)

setSmsContact('SoSynpL')

const sendCustomerConfirmEmail = ({user, email_validation_url}) => {
  return sendNotification({
    notification: SIB_IDS.CUSTOMER_CONFIRM_EMAIL,
    destinee: user,
    params: {
      firstname: user.firstname,
      email_validation_url,
    },
  })
}


module.exports = {
  sendCustomerConfirmEmail,
}
