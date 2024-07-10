const mongoose=require('mongoose')
const Block = require("../../models/Block")

const PathSchema = new mongoose.Schema({
  blocks: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'block'
  }],
})

const pathModel=mongoose.model('path', PathSchema)

const getTemplateForBlock = async blockId => {
  const block=await Block.findById(blockId)
  if (!block) {
    throw new Error('Block does not exists')
  }
  if (!block.origin) {
    return block
  }
  return getTemplateForBlock(block.origin)
}

const getPathsForResource = async (blockId) => {
  const block=await Block.findById(blockId)
  let res=[]
  if (block) {
    const template=await getTemplateForBlock(block._id)
    res=[{id: template._id, name: template.name, type:template.type}]
    // console.log('path', idx, block.type, block._id, block.name)
    if (block.parent) {
      res=[...res, ...await getPathsForResource(block.parent._id)]
    }
  }
  return res
}

const getPathsForTemplate = async (blockId) => {
  const block=await Block.findById(blockId)
  let res=[await getPathsForResource(blockId)]
  console.log(res[0].map(b => `${b.type}-${b.name}`).join('/'))
  // console.log('res is', res)
  const linkeds=await Block.find({origin: blockId})
  for (const linked of linkeds) {
    res=[...res, await getPathsForTemplate(linked._id)]
    // console.log('res is', res)
  }
  return res
}

module.exports= {
  getTemplateForBlock, getPathsForTemplate,
}