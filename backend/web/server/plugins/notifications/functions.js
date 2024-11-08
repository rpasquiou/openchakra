const mongoose = require('mongoose')
const { createNotificationSchema } = require('./schemas/NotificationSchema')
const { declareEnumField, declareVirtualField } = require('../../utils/database')

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
  mongoose.model('notification', NotificationSchema)

//TODO mongoose : need at least mongoose 8.2.0 to use recompileSchema
//   //Adding virtuals to userSchema
//   const User = mongoose.models.user
//   User.schema.virtual('pending_notifications_test_virtual', {
//     ref:'notification',
//     localField:'_id',
//     foreignField:'recipients',
//     options: {
//       match: {seen_by_recipients: {$nin: this._id}}
//     }
//   })

//   User.schema.virtual('pending_notifications_count_test_virtual', {
//     ref:'notification',
//     localField:'_id',
//     foreignField:'recipients',
//     options: {
//       match: {seen_by_recipients: {$nin: this._id}}
//     },
//     count: true
//   })
//   User.recompileSchema()
//
  // //user declarations
  // declareVirtualField({model: 'user', field: 'pending_notifications_test_virtual', instance: 'Array', multiple: true,
  //   caster: {
  //     instance: 'ObjectID',
  //     options: { ref: 'notification' }
  //   },
  // })
  // declareVirtualField({model: 'user', field: 'pending_notifications_count_test_virtual', instance: 'Number'})

  //notification declarations
  declareEnumField({model: 'notification', field: 'type', enumValues: types})

}

const getPendingNotifications = async function (userId, params, data) {
  const NotificationModel = mongoose.models.notification
  const notifs = await NotificationModel.find({recipients: {$in: data._id}, seen_by_recipients: {$nin: data._id}})
  return notifs
}

const getPendingNotificationsCount = async function (userId, params, data) {
  const NotificationModel = mongoose.models.notification
  const notifCount = await NotificationModel.countDocuments({recipients: {$in: data._id}, seen_by_recipients: {$nin: data._id}})
  return notifCount
}

const getNotifications = async function (userId, params, data) {
  const NotificationModel = mongoose.models.notification
  const notifs = await NotificationModel.find({recipients: {$in: data._id}})
  return notifs
}

const getNotificationsCount = async function (userId, params, data) {
  const NotificationModel = mongoose.models.notification
  const notifCount = await NotificationModel.countDocuments({recipients: {$in: data._id}})
  return notifCount
}

module.exports = {
  setAllowedTypes,
  setComputeUrl,
  setComputeMessage,
  getPendingNotifications,
  getPendingNotificationsCount,
  getNotifications,
  getNotificationsCount,
}