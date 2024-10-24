const mongoose = require('mongoose')
const {getDataModel}=require('../../config/config')

let NoteSchema=null

try {
  NoteSchema=require(`../plugins/${getDataModel()}/schemas/NoteSchema`)
  NoteSchema.plugin(require('mongoose-lean-virtuals'))
}
catch(err) {
  if (err.code !== 'MODULE_NOT_FOUND') {
    throw err
  }
}

module.exports = NoteSchema ? mongoose.model('note', NoteSchema) : null
