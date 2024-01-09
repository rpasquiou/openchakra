const {getDataModel}=require('../../config/config')

let Sequence = null

try {
  const Block = require(`./Block`)
  if (Block) {
    const SequenceSchema=require(`../plugins/${getDataModel()}/schemas/SequenceSchema`)
    SequenceSchema.plugin(require('mongoose-lean-virtuals'))
    Sequence = Block.discriminator('sequence', SequenceSchema)
  }
}
catch (err) {
  console.error(err)
  if (err.code !== 'MODULE_NOT_FOUND') {
    throw err
  }
}

module.exports = Sequence
