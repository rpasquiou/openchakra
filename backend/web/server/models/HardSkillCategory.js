const mongoose = require('mongoose')
const {getDataModel}=require('../../config/config')

let HardSkillCategorySchema=null

try {
  HardSkillCategorySchema=require(`../plugins/${getDataModel()}/schemas/HardSkillCategorySchema`)
  HardSkillCategorySchema.plugin(require('mongoose-lean-virtuals'))
}
catch(err) {
  if (err.code !== 'MODULE_NOT_FOUND') {
    throw err
  }
}

module.exports = HardSkillCategorySchema ? mongoose.model('hardSkillCategory', HardSkillCategorySchema) : null
