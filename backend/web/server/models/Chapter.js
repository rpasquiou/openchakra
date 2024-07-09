const {getDataModel}=require('../../config/config')

let Chapter = null

try {
  const Block = require(`./Block`)
  if (Block) {
    const ChapterSchema=require(`../plugins/${getDataModel()}/schemas/ChapterSchema`)
    ChapterSchema.plugin(require('mongoose-lean-virtuals'))
    Chapter = Block.discriminator('chapter', ChapterSchema)
  }
}
catch (err) {
  console.error(err)
  if (err.code !== 'MODULE_NOT_FOUND') {
    throw err
  }
}

module.exports = Chapter
