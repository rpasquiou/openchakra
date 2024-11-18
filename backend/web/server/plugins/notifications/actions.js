const mongoose = require('mongoose')
const { NotFoundError, ForbiddenError } = require('../../utils/errors')
const { addAction } = require('../../utils/studio/actions')
const { getModel } = require('../../utils/database')
const { callComputeUrl } = require('./functions')


const validateNotification = async ({value}, user) => {
  //check if value is a notif id in case validate action is used elsewhere
  const model = await getModel(value)
  if (model == 'notification') {
    //add user to seen_by_recipients
    await mongoose.models[model].findByIdAndUpdate(value,{$addToSet: {seen_by_recipients: user._id}})
  }
}

addAction('validate',validateNotification)


const addNotification = ({users, targetId, targetType, text, type, customData, picture}) => {
  const NotificationModel = mongoose.models.notification

  return NotificationModel.create({
    recipients: users,
    _target: targetId,
    _target_type: targetType,
    text: text,
    type: type,
    url: callComputeUrl(targetId, targetType),
    custom_data: customData,
    picture
  })
}

const isNotification = async (notifId) => {
  const NotificationModel = mongoose.models.notification
  //if notification model not defined
  if (!NotificationModel) {
    throw new NotFoundError(`No notification model found`)
  }

  const notif = await NotificationModel.findById(notifId, 'recipients seen_by_recipients _target _target_type')
  //if no notif with notifId
  if (!notif) {
    throw new NotFoundError(`No notification found with id: ${notifId}`)
  }
  return notif
}

const isRecipient = (notif, user) => {
  if (!(lodash.includes(notif.recipients,user._id))) {
    throw new ForbiddenError(`User ${user._id} is not a recipient of notification ${dataId} `)
  }
}

//remove a user from a notification and returns the updated notification
const deleteUserNotification = async (notifId, user) => {
  const notif = await mongoose.models.notification.findByIdAndUpdate(notifId, {$pull: {recipents: user._id, seen_by_recipients: user_id}}, {returnDocument: 'after'})
  return notif
}

const isDeleteUserNotificationAllowed = async ({dataId, user}) => {
  const notif = await isNotification(dataId)

  //if user not in recipients
  isRecipient(notif,user)

  return true
}

const isValidateNotificationAllowed = async ({dataId, user, ...rest}) => {
  const notif = await isNotification(dataId)

  //if user not in recipients
  isRecipient(notif, user)

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
  isValidateNotificationAllowed,
  addNotification,
  deleteUserNotification,
  isDeleteUserNotificationAllowed,
}