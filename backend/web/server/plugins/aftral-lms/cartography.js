const Block = require("../../models/Block")
const { loadFromDb } = require("../../utils/database")

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

const _getPathsForTemplate = async blockId => {
  let res=[]
  const block=await Block.findById(blockId)
  if (block?.parent) {
    res=[block.parent]
  }
  const origins=await Block.find({origin: blockId})
  res=[...res, ...origins.map(o => o._id)]
  let obtained=block ? [block._id]: []
  for (const r of res) {
    obtained=[...obtained, ...await _getPathsForTemplate(r)]
  }
  return [...res, ...obtained]
}

const getPathsForTemplate = async blockId => {
  const res=await _getPathsForTemplate(blockId)
  const blocks=await Block.find({_id: {$in: res}, origin: null})
  console.log(blocks.map(b => [b.type, b.name]))
  return blocks
}

module.exports= {
  getTemplateForBlock, getPathsForTemplate,
}