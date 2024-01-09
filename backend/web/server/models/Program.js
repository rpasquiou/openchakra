const {getDataModel}=require('../../config/config')

let Program = null

try {
  const Block = require(`./Block`)
  if (Block) {
    const ProgramSchema=require(`../plugins/${getDataModel()}/schemas/ProgramSchema`)
    ProgramSchema.plugin(require('mongoose-lean-virtuals'))
    Program = Block.discriminator('program', ProgramSchema)
  }
}
catch (err) {
  console.error(err)
  if (err.code !== 'MODULE_NOT_FOUND') {
    throw err
  }
}

module.exports = Program
