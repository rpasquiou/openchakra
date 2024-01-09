const {getDataModel}=require('../../config/config')

let Resource = null

try {
  const Block = require(`./Block`)
  if (Block) {
    const ResourceSchema=require(`../plugins/${getDataModel()}/schemas/ResourceSchema`)
    ResourceSchema.plugin(require('mongoose-lean-virtuals'))
    Resource = Block.discriminator('resource', ResourceSchema)
  }
}
catch (err) {
  console.error(err)
  if (err.code !== 'MODULE_NOT_FOUND') {
    throw err
  }
}

module.exports = Resource
