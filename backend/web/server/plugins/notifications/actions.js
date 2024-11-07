const mongoose = require("mongoose");
const { NotFoundError, ForbiddenError } = require("../../utils/errors");

const isValidateNotificationActionAllowed = async ({dataId, user, ...rest}) => {
  const NotificationModel = mongoose.models.notification
  //if notification model not defined
  if (!NotificationModel) {
    throw new NotFoundError(`No notification model found`)
  }

  const notif = NotificationModel.findById(dataId, 'recipients seen_by_recipients _target _target_type')
  //if no notif with dataId
  if (!notif) {
    throw new NotFoundError(`No notification found with id: ${dataId}`)
  }

  //if user not in recipients
  if (!(lodash.includes(notif.recipients,user._id))) {
    throw new ForbiddenError(`User ${user._id} is not a recipient of notification ${dataId} `)
  }

  //if notif already seen by  user
  if (lodash.includes(notif.seen_by_recipients,user._id)) {
    throw new Error(`User ${user._id} has already seen notification ${dataId}`)
  }

  //if model target_type does not exist
  const targetModel = mongoose.models[notif._target_type]
  if (!targetModel) {
    throw new NotFoundError(`No model ${notif._target_type} found`)
  }

  //if target does not exist
  const target = targetModel.findById(notif._target)
  if (!target) {
    throw new NotFoundError(`No object with id ${notif._target} for model ${notif._target_type}`)
  }

  return true
}

module.exports = {
  isValidateNotificationActionAllowed,
}