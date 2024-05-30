const mongoose = require('mongoose')
const {getDataModel} = require('../../config/config')

let HardSkillSchema=null

try {
  HardSkillSchema=require(`../plugins/${getDataModel()}/schemas/HardSkillSchema`)
  HardSkillSchema.plugin(require('mongoose-lean-virtuals'))
}
catch(err) {
  if (err.code !== 'MODULE_NOT_FOUND') {
    throw err
  }
}

module.exports = HardSkillSchema ? mongoose.model('hardSkill', HardSkillSchema) : null
