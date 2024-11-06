const mongoose = require('mongoose')
const lodash=require('lodash')
const { MONGOOSE_OPTIONS } = require('../../server/utils/database')
const Block = require('../../server/models/Block')
const { BLOCK_TYPE, ROLE_CONCEPTEUR } = require('../../server/plugins/aftral-lms/consts')
const { getDatabaseUri } = require('../../config/config')
require('../../server/plugins/aftral-lms/functions')

const getBlockName = block => {
  if (!block) {
    return null
  }
  return `${block._id} ${block.type} ${block.name}`
}

const getBlockHierarchyName = async block => {
  const thisName=await getBlockName(block)
  if (!block?.parent) {
    return thisName
  }
  const parentName=await getBlockHierarchyName(await Block.findById(block.parent).lean())
  return `${parentName}/${thisName}`
}

const getChildren = async id => {
  return Block.find({parent: id}).sort({order:1})
}

const checkChildrenPropagation = async() => {
  console.log('*'.repeat(10), 'START children propagation')
  const blocks=await Block.find({[BLOCK_TYPE]: {$nin: ['resource', 'session']}, origin: {$ne: null}, _locked: false}).lean()
  const grouped=lodash(blocks).groupBy(BLOCK_TYPE).mapValues(v => v.length)
  console.log(grouped.value())
  for (const block of blocks) {
    const actuals=await getChildren(block._id)
    const expected=await getChildren(block.origin._id)
    const msg=`Block ${await getBlockHierarchyName(block)} should have\n${expected.map(e => ' -'+getBlockName(e)+'('+e.order+')').join('\n')}\nbut has\n${actuals.map(e => ' -'+getBlockName(e)+' from '+e.origin).join('\n')}`
    const msgexists=`Origine inconnue pour ${await getBlockName(block)}}`
    const originExists=await Block.exists({_id: block.origin._id})
    const childrenDiffer=actuals.map(c => c.name).join(',')!=expected.map(c => c.name).join(',')
    try {
      if (!originExists) {
        await Block.deleteOne({_id: block._id})
        throw new Error(msgexists)
      }
      if (childrenDiffer) {
        const actualNames = actuals.map(c => c.name)
        const expectedNames = expected.map(c => c.name)
        const justUnordered=lodash.isEqual(actualNames.sort(), expectedNames.sort())
        const justExtra=lodash.intersection(actualNames, expectedNames).length==expected.length && lodash.difference(actualNames, expectedNames)
        if (justUnordered) {
          await Promise.all(expected.map(async expected => {
            console.log(` - Setting ${expected.name} order to ${expected.order}`)
            await Block.findOneAndUpdate({ parent: block._id, origin: expected._id}, { order: expected.order })
          }))
        }
        if (justExtra) {
          await Block.deleteMany({parent: block._id, origin: {$nin: expected}})
        }
        throw new Error((justUnordered? 'Just order problem:':justExtra? 'Just extra child': '')+msg)
      }
    }
    catch(err) {
      console.log(err.message+'\n')
    }
  }
  console.log('*'.repeat(10), 'END Checking children propagation')
}

const checkChildrenOrder = async() => {
  console.log('*'.repeat(10), 'START children order')
  const blocks=await Block.find({parent: {$ne:null}}, {parent:1, order:1}).sort({parent:1, order:1}).lean()
  const grouped=lodash(blocks)
    .groupBy(b=>b.parent._id.toString())
    .omitBy(v => v.length<2)
  grouped.values().forEach(v => {
    const orders=v.map(child => child.order-1)
    const expected=lodash.range(v.length)
    if (!lodash.isEqual(orders, expected)) {
      console.log(`Incorrect children order for ${v[0].parent}:${orders}, expected ${expected}`)
    }
  })
  console.log('*'.repeat(10), 'END children order')
}

const checkConsistency = async () => {
  await mongoose.connect(getDatabaseUri(), MONGOOSE_OPTIONS)
  await checkChildrenPropagation()
  await checkChildrenOrder()
}

checkConsistency()
  .catch(console.error)
  .finally(() => process.exit(0))
