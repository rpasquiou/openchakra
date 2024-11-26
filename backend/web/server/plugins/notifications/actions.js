const mongoose = require('mongoose')
const { NotFoundError, ForbiddenError } = require('../../utils/errors')
const lodash = require('lodash')
const { addAction } = require('../../utils/studio/actions')
const { getModel, idEqual } = require('../../utils/database')


const validateNotification = async ({value}, user) => {
  //check if value is a notif id in case validate action is used elsewhere
  const model = await getModel(value)
  let notif
  if (model == 'notification') {
    //add user to seen_by_recipients
    notif = await mongoose.models[model].findByIdAndUpdate(value,{$addToSet: {seen_by_recipients: user._id}})
  }
  return notif
}

addAction('validate',validateNotification)


const addNotification = async ({users, targetId, targetType, type, customData}) => {
  const NotificationModel = mongoose.models.notification

  return NotificationModel.create({
    recipients: users,
    _target: targetId,
    _target_type: targetType,
    type: type,
    custom_data: customData,
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

const isRecipient = (notif, user, dataId) => {
  if (!(lodash.find(notif.recipients,(v) => idEqual(user._id, v)))) {
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
  isRecipient(notif,user, dataId)

  return true
}

const isValidateNotificationAllowed = async ({dataId, user, ...rest}) => {
  const notif = await isNotification(dataId)

  //if user not in recipients
  isRecipient(notif, user, dataId)

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