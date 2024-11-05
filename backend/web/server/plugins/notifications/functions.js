const { Mongoose } = require("mongoose")
const { createNotificationSchema } = require("./schemas/NotificationSchema")

const setAllowedTypes = types => {
  //build schema
  const NotificationSchema = createNotificationSchema(types)

  //build model
  NotificationSchema.plugin(require('mongoose-lean-virtuals'))
  Mongoose.model('notification', NotificationSchema)
}


module.exports = {
  setAllowedTypes,
}