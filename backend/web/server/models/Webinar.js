const {getDataModel} = require('../../config/config')
const {customizeSchema}=require('../../server/utils/database')
const Event = require(`./Event`)

let Webinar = null
try {
  if (Event) {
    const WebinarSchema = require(`../plugins/${getDataModel()}/schemas/WebinarSchema`)
    customizeSchema(WebinarSchema)
    Webinar = Event.discriminator('webinar', WebinarSchema)
  }
}
catch (err) {
  console.log('no webinar')
  if (err.code !== 'MODULE_NOT_FOUND') {
    throw err
  }
}

module.exports = Webinar
