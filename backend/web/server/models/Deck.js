const mongoose = require('mongoose')
const {getDataModel} = require('../../config/config')

let DeckSchema=null

try {
  DeckSchema=require(`../plugins/${getDataModel()}/schemas/DeckSchema`)
  DeckSchema.plugin(require('mongoose-lean-virtuals'))
}
catch(err) {
  if (err.code !== 'MODULE_NOT_FOUND') {
    throw err
  }
}

module.exports = DeckSchema ? mongoose.model('deck', DeckSchema) : null
