const {getDataModel}=require('../../config/config')

let Session = null

try {
  const Block = require(`./Block`)
  if (Block) {
    const SessionSchema=require(`../plugins/${getDataModel()}/schemas/SessionSchema`)
    SessionSchema.plugin(require('mongoose-lean-virtuals'))
    Session = Block.discriminator('session', SessionSchema)
  }
}
catch (err) {
  console.error(err)
  if (err.code !== 'MODULE_NOT_FOUND') {
    throw err
  }
}

module.exports = Session
