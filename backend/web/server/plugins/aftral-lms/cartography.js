const mongoose=require('mongoose')
const lodash=require('lodash')
const Block = require("../../models/Block")
const { paths } = require('../../models/AddressSchema')
const { idEqual } = require('../../utils/database')

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

const getPathsForTemplate = async (userID, params, blockId) => {
  const block=await Block.findById(blockId)
  let res=[new Path({blocks: await getPathsForResource(blockId)})]
  const linkeds=await Block.find({origin: blockId})
  for (const linked of linkeds) {
    res=[...res, ...await getPathsForTemplate(userID, params, linked._id)]
  }
  return res
}

const getPathsForBlock = async (userID, params, blockId) => {
  const allPaths=await getPathsForTemplate(userID, params, blockId)
  const pathToString=path => path.blocks.map(b => `${b.type}-${b.name}`).join('/')+'/'
  const isPrefix= (p1, p2) => {
    const pref=p1!=p2 && p2.startsWith(p1)
    return pref
  }
  let filteredPaths=allPaths.filter(p => !allPaths.some(op => isPrefix(pathToString(p), pathToString(op))))
  filteredPaths=lodash.uniqBy(filteredPaths, pathToString)
  return filteredPaths

}

module.exports= {
  getTemplateForBlock, getPathsForBlock,
}