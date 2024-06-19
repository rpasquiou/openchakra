const moment=require('moment')
const mongoose = require('mongoose')
const lodash=require('lodash')
const {MONGOOSE_OPTIONS, loadFromDb} = require('../../server/utils/database')
const User=require('../../server/models/User')
const Resource=require('../../server/models/Resource')
const Sequence=require('../../server/models/Sequence')
const Module=require('../../server/models/Module')
const Program=require('../../server/models/Program')
const { ROLE_CONCEPTEUR, RESOURCE_TYPE } = require('../../server/plugins/aftral-lms/consts')
const { updateAllDurations, updateDuration } = require('../../server/plugins/aftral-lms/functions')
const Block = require('../../server/models/Block')

const generatePopulate = (path, level) => {
  if (level==0) {
    return undefined
  }
  return {path: 'children', populate: generatePopulate(path, level-1)}
}

const getTreeRoots = async () => {
  return Block.find({}).populate(['origin', generatePopulate('children', 8)]);
}

const getNodeName = block => `"${block.type}-${block.name} ${(block._id)}"`

const generateLinksChain = block => {
  return [
    block.children.map(c => `${getNodeName(block)} -> ${getNodeName(c)};`),
    ...block.children.map(generateLinksChain),
  ]
}

const generateDotTree = (block, index) => {
  const all_links=lodash.flattenDeep(generateLinksChain(block))
  return `subgraph cluster_${index} {
    label = ${getNodeName(block)};
    style=filled;
    color=${!!block.origin ? 'red' : 'green'};
    ${getNodeName(block)}
  ${all_links.join('\n')}
  }`
}

const generateDotGraph = async () => {
  await mongoose.connect(`mongodb://localhost/aftral-lms`, MONGOOSE_OPTIONS)
  const roots=await getTreeRoots()
  const graph=`digraph G {
    ${roots.map((block, index) => generateDotTree(block, index)).join('\n')}
  }`
  console.log(graph)
  return Promise.resolve(true)
}

generateDotGraph()
  .then(console.log)
  .catch(console.error)