const mongoose=require('mongoose')
const Block = require("../../models/Block")

const PathSchema = new mongoose.Schema({
  blocks: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'block'
  }],
})

const Path=mongoose.model('path', PathSchema)

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
    res=[new Block({_id: template._id, name: template.name, type:template.type})]
    // console.log('path', idx, block.type, block._id, block.name)
    if (block.parent) {
      res=[...res, ...await getPathsForResource(block.parent._id)]
    }
  }
  return res
}

const getAllPathsForBlock = async (blockId) => {
  const block=await Block.findById(blockId)
  let res=[new Path({blocks: await getPathsForResource(blockId)})]
  const linkeds=await Block.find({origin: blockId})
  for (const linked of linkeds) {
    res=[...res, ...await getAllPathsForBlock(linked._id)]
  }
  return res
}

const getPathsForBlock = async (_userID, _params, blockId) => {
  const allPaths=await getAllPathsForBlock(blockId)
}

module.exports= {
  getTemplateForBlock, getPathsForBlock,
}