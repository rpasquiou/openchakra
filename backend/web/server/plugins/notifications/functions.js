const mongoose = require('mongoose')
const { createNotificationSchema } = require('./schemas/NotificationSchema')
const { declareEnumField, declareVirtualField, declareComputedField, loadFromDb } = require('../../utils/database')

let computeUrl = (targetId, targetType) => {
  return ``
}

const setComputeUrl = (fn) => {
  computeUrl = fn
}

const callComputeUrl = async (...params) => {
  return computeUrl(...params)
}

let computeMessage = (text) => {
  return text
}

const setComputeMessage = (fn) => {
  computeMessage = fn
}

const callComputeMessage = async (...params) => {
  return computeMessage(...params)
}

let computePicture = (picture) => {
  return picture
}

const setComputePicture = (fn) => {
  computePicture = fn
}

const callComputePicture = async (...params) => {
  return computePicture(...params)
}

const setAllowedTypes = types => {
  //build schema
  const NotificationSchema = createNotificationSchema(types)

  //build model
  NotificationSchema.plugin(require('mongoose-lean-virtuals'))
  mongoose.model('notification', NotificationSchema)

//TODO mongoose : need at least mongoose 8.2.0 to use recompileSchema, while we can't use it, virtuals are computed in project schema instead
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
  declareComputedField({model: 'notification', field: 'url', getterFn: callComputeUrl})
  declareComputedField({model: 'notification', field: 'text', getterFn: callComputeMessage})
  declareComputedField({model: 'notification', field: 'picture', getterFn: callComputePicture})

}

const getPendingNotifications = async function (userId, params, data) {
  //console.log('params',params);
  //récupérer sort et limit pour le champ unseen_notifications

  
  const notifs = await loadFromDb({
    model: 'notification',
    fields: ['text', 'url','picture','_target','_target_type'],
    params: {'filter.recipients':{$in: [data._id]}, 'filter.seen_by_recipients': {$nin: [data._id]}}
  })
  
  const NotificationModel = mongoose.models.notification
  return notifs.map(n => new NotificationModel(n))
}

const getPendingNotificationsCount = async function (userId, params, data) {
  const NotificationModel = mongoose.models.notification
  const notifCount = await NotificationModel.countDocuments({recipients: {$in: data._id}, seen_by_recipients: {$nin: data._id}})
  return notifCount
}

const getSeenNotifications = async function (userId, params, data) {
  //récupérer sort et limit pour le champ unseen_notifications


  const notifs = await loadFromDb({
    model: 'notification',
    fields: ['text', 'url','picture','_target','_target_type'],
    params: {'filter.recipients':{$in: [data._id]}}
  })
  
  const NotificationModel = mongoose.models.notification
  return notifs.map(n => new NotificationModel(n))
}

const getSeenNotificationsCount = async function (userId, params, data) {
  const NotificationModel = mongoose.models.notification
  const notifCount = await NotificationModel.countDocuments({seen_by_recipients: {$in: data._id}})
  return notifCount
}

module.exports = {
  setAllowedTypes,
  setComputeUrl,
  setComputeMessage,
  setComputePicture,
  getPendingNotifications,
  getPendingNotificationsCount,
  getSeenNotifications,
  getSeenNotificationsCount,
}