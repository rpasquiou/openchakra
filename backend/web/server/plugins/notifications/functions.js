const { Mongoose } = require("mongoose")
const { createNotificationSchema } = require("./schemas/NotificationSchema")
const { declareEnumField } = require("../../utils/database")

let computeUrl = (targetId, targetType) => {
  return ``
}

const setComputeUrl = (fn) => {
  computeUrl = fn
}

let computeMessage = (text) => {
  return text
}

const setComputeMessage = (fn) => {
  computeMessage = fn
}

const setAllowedTypes = types => {
  //build schema
  const NotificationSchema = createNotificationSchema(types)

  //build model
  NotificationSchema.plugin(require('mongoose-lean-virtuals'))
  Mongoose.model('notification', NotificationSchema)

  //declarations
  declareEnumField({model: 'notification', field: 'type', enumValues: types})
}

const addNotification = ({users, targetId, targetType, text, type, customProps, picture}) => {
  const NotificationModel = Mongoose.models.notification
  return NotificationModel.create({
    recipents: users,
    _target: targetId,
    _target_type: targetType,
    text: computeMessage(text),
    type: type,
    url: computeUrl(targetId, targetType),
    custom_props: customProps,
    picture
  })
}

const getPendingNotifications = async function (userId, params, data) {
  const NotificationModel = Mongoose.models.notification
  const notifs = await NotificationModel.find({recipients: {$in: data._id}, seen_by_recipients: {$nin: data._id}})
  return notifs
}

const getPendingNotificationsCount = async function (userId, params, data) {
  const NotificationModel = Mongoose.models.notification
  const notifCount = await NotificationModel.countDocuments({recipients: {$in: data._id}, seen_by_recipients: {$nin: data._id}})
  return notifCount
}

module.exports = {
  setAllowedTypes,
  setComputeUrl,
  setComputeMessage,
  addNotification,
  getPendingNotifications,
  getPendingNotificationsCount
}