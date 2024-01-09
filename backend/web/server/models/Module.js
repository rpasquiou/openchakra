const {getDataModel}=require('../../config/config')

let Module = null

try {
  const Block = require(`./Block`)
  if (Block) {
    const ModuleSchema=require(`../plugins/${getDataModel()}/schemas/ModuleSchema`)
    ModuleSchema.plugin(require('mongoose-lean-virtuals'))
    Module = Block.discriminator('module', ModuleSchema)
  }
}
catch (err) {
  console.error(err)
  if (err.code !== 'MODULE_NOT_FOUND') {
    throw err
  }
}

module.exports = Module
