const {getDataModel} = require('../../config/config')
const Event = require(`./Event`)
const {customizeSchema}=require('../../server/utils/database')

let Menu = null
try {
  if (Event) {
    const MenuSchema = require(`../plugins/${getDataModel()}/schemas/MenuSchema`)
    customizeSchema(MenuSchema)
    Menu = Event.discriminator('menu', MenuSchema)
  }
}
catch (err) {
  if (err.code !== 'MODULE_NOT_FOUND') {
    throw err
  }
}

module.exports = Menu
