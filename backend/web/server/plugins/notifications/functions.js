const { Mongoose } = require("mongoose")
const { createNotificationSchema } = require("./schemas/NotificationSchema")

let computeUrl = () => {
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


module.exports = {
  setAllowedTypes,
  setComputeUrl,
  setComputeMessage,
}