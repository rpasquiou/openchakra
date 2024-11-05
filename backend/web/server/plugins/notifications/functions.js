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
  const NotificationModel= Mongoose.models.notification
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

module.exports = {
  setAllowedTypes,
  setComputeUrl,
  setComputeMessage,
  addNotification,
}