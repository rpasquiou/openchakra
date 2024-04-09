const mongoose=require("mongoose")
const User = require("../../models/User")
const { getModel } = require("../../utils/database")
const { NotFoundError, BadRequestError, ForbiddenError } = require("../../utils/errors")
const { addAction, setAllowActionFn } = require("../../utils/studio/actions")
const { ROLE_ADMIN } = require("../smartdiet/consts")
const { SUSPEND_STATE_SUSPENDED, SUSPEND_STATE_NOT_SUSPENDED} = require("./consts")

const validate_email = async ({ value }) => {
  const user=await User.exists({_id: value})
  if (!user) {
    throw new NotFoundError(`Ce compte n'existe pas`)
  }
  return User.findByIdAndUpdate(value, {email_valid: true})
}

addAction('validate_email', validate_email)

const deactivateAccount = async ({reason}, user) => {
  const ok=await isActionAllowed({action:'deactivateAccount', user})
  if (!ok) {return false}
  const model=await getModel(user._id)
  return mongoose.models[model].findByIdAndUpdate(
    user._id,
    {active: false, deactivation_reason: reason},
    {runValidators: true, new: true},
  )
}
addAction('deactivateAccount', deactivateAccount)

const suspendAccount = async ({value, reason}, user) => {
  const ok=await isActionAllowed({action:'suspend_account', dataId: value, user})
  if (!ok) {return false}
  const model=await getModel(value)
  await mongoose.models[model].findByIdAndUpdate(
    value,
    {suspended_status: SUSPEND_STATE_SUSPENDED, suspended_reason: reason},
    {runValidators: true, new: true},
  )
}
addAction('suspend_account', suspendAccount)

const releaseAccount = async ({value, reason}, user) => {
  const ok=await isActionAllowed({action:'release_account', dataId: value, user})
  if (!ok) {return false}
  const model=await getModel(value)
  await mongoose.models[model].findByIdAndUpdate(
    value,
    {suspended_status: SUSPEND_STATE_NOT_SUSPENDED, suspended_reason:null},
    {runValidators: true, new: true},
  )
}
addAction('release_account', releaseAccount)


const isActionAllowed = async ({ action, dataId, user, actionProps }) => {
  if (action=='validate_email') {
    return true
  }
  if (action=='register') {
    return true
  }
  if (action=='deactivateAccount') {
    const logged_user=await User.findById(user._id, {active:1})
    if (logged_user.active==false) {
      throw new BadRequestError(`Ce compte est déjà désactivé`)
    }
  }
  if (['suspend_account', 'release_account'].includes(action)) {
    if (user.role!=ROLE_ADMIN) {
      throw new ForbiddenError('Action interdite')
    }
    const suspend=action=='suspend_account'
    const target_user=await User.findById(dataId, { suspended_status:1})
    if (suspend && target_user.suspended_status==SUSPEND_STATE_SUSPENDED) {
      throw new ForbiddenError('Compte déjà suspendu')
    }
    if (!suspend && target_user.suspended_status==SUSPEND_STATE_NOT_SUSPENDED) {
      throw new ForbiddenError('Compte déjà actif')
    }
  }
  return true
}

setAllowActionFn(isActionAllowed)
