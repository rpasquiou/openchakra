const User = require("../../models/User")
const { NotFoundError } = require("../../utils/errors")
const { addAction, setAllowActionFn } = require("../../utils/studio/actions")

const validate_email = async ({ value }) => {
  const user=await User.exists({_id: value})
  if (!user) {
    throw new NotFoundError(`Ce compte n'existe pas`)
  }
  return User.findByIdAndUpdate(value, {email_valid: true})
}

addAction('validate_email', validate_email)


const isActionAllowed = async ({ action, dataId, user, actionProps }) => {
  if (action=='validate_email') {
    return true
  }
  if (action=='register') {
    return true
  }
}

setAllowActionFn(isActionAllowed)
