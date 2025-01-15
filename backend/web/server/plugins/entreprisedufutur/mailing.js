const { sendNotification, getTagUrl, addValidationAllowedDomain } = require('../../utils/mailing')
const { RESET_TOKEN_VALIDITY } = require('./consts')
const { computeUrl } = require('../../../config/config')

const SIB_IDS = {
  RESET_PASSWORD: 1, // OK
}

//addValidationAllowedDomain('entreprisedufutur')

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
module.exports = {
  sendResetPassword,
}