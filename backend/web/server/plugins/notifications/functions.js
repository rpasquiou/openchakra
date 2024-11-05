const { Mongoose } = require("mongoose")
const { createNotificationSchema } = require("./schemas/NotificationSchema")

let computeUrl = (targetId, targetType) => {
  return ``
}

const setComputeUrl = (fn) => {
  computeUrl = fn
}

let computeMessage = (notif) => {
  return notif._text
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
}

const addNotification = ({users, targetId, targetType, text, type, customProps, picture}) => {
  const url = computeUrl(targetId, targetType)
  const NotificationModel= Mongoose.models.notification
  return NotificationModel.create({
    recipents: users,
    _target: targetId,
    _target_type: targetType,
    _text: text,
    type: type,
    url: url,
    custom_props: customProps,
    picture
  })
}

module.exports = {
  setAllowedTypes,
  setComputeUrl,
  setComputeMessage,
  addNotification,
}