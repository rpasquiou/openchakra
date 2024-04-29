const mongoose=require("mongoose")
const User = require("../../models/User")
const { getModel } = require("../../utils/database")
const { NotFoundError, BadRequestError, ForbiddenError } = require("../../utils/errors")
const { addAction, setAllowActionFn } = require("../../utils/studio/actions")
const { ROLE_ADMIN } = require("../smartdiet/consts")
const { ACTIVITY_STATE_SUSPENDED, ACTIVITY_STATE_ACTIVE, ACTIVITY_STATE_DISABLED} = require("./consts")

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
    {activity_status: ACTIVITY_STATE_DISABLED, deactivation_reason: reason},
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
    {activity_status: ACTIVITY_STATE_SUSPENDED, suspended_reason: reason},
    {runValidators: true, new: true},
  )
}
addAction('suspend_account', suspendAccount)

const activateAccount = async ({value, reason}, user) => {
  const ok=await isActionAllowed({action:'activate_account', dataId: value, user})
  console.log('can activate', !!ok)
  if (!ok) {return false}
  const model=await getModel(value)
  return mongoose.models[model].findByIdAndUpdate(
    value,
    {activity_status: ACTIVITY_STATE_ACTIVE, suspended_reason:null},
    {runValidators: true, new: true},
  )
}
addAction('activate_account', activateAccount)


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
  if (['suspend_account', 'activate_account'].includes(action)) {
    if (user.role!=ROLE_ADMIN) {
      throw new ForbiddenError('Action interdite')
    }
    const suspend=action=='suspend_account'
    const target_user=await User.findById(dataId, { activity_status:1})
    // Disabled account cannot be restored
    if (!suspend && target_user.activity_status==ACTIVITY_STATE_DISABLED) {
      throw new ForbiddenError('Un compte désactivé ne peut être réactivé')
    }
    if (suspend && target_user.activity_status==ACTIVITY_STATE_SUSPENDED) {
      throw new ForbiddenError('Compte déjà suspendu')
    }
    if (!suspend && target_user.activity_status==ACTIVITY_STATE_ACTIVE) {
      throw new ForbiddenError('Compte déjà actif')
    }
  }
  return true
}

setAllowActionFn(isActionAllowed)
