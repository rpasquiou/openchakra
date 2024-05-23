const mongoose = require('mongoose')
const {getDataModel} = require('../../config/config')

let Schema=null

try {
    Schema=require(`../plugins/${getDataModel()}/schemas/CoachingStatSchema`)
    Schema.plugin(require('mongoose-lean-virtuals'))
}
catch(err) {
  console.error('**********************',err)
  if (err.code !== 'MODULE_NOT_FOUND') {
    throw err
  }
}

module.exports = Schema ? mongoose.model('coachingStat', Schema) : null
