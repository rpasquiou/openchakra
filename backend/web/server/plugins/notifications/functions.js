const { createNotificationSchema } = require("./schemas/NotificationSchema")

let allowedTypes = null

const setAllowedTypes = types => {
  allowedTypes = types
  const notificationSchema = createNotificationSchema(allowedTypes)
  //créer modèle
}


module.exports = {
  setAllowedTypes,
}