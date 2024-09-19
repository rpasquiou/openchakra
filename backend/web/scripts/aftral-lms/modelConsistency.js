const mongoose = require('mongoose')
const lodash=require('lodash')
const { MONGOOSE_OPTIONS } = require('../../server/utils/database')
const Block = require('../../server/models/Block')
const { BLOCK_TYPE, ROLE_CONCEPTEUR } = require('../../server/plugins/aftral-lms/consts')
const { getDatabaseUri } = require('../../config/config')
const { runPromisesWithDelay } = require('../../server/utils/concurrency')
const {addChildAction}=require('../../server/plugins/aftral-lms/actions')
const User = require('../../server/models/User')

const getBlockName = block => {
  if (!block) {
    return null
  }
  // return `${block.type} ${block.name} (${block._id})`
  return `${block.type} ${block.name})`
}

const getBlockHierarchyName = async block => {
  const thisName=await getBlockName(block)
  if (!block?.parent) {
    return thisName
  }
  const parentName=await getBlockHierarchyName(await Block.findById(block.parent).lean())
  return `${parentName}/${thisName}`
}

const countChildren = async id => {
  return Block.countDocuments({parent: id})
}

const checkChildrenPropagation = async() => {
  console.log('*'.repeat(10), 'START children propagation')
  const blocks=await Block.find({[BLOCK_TYPE]: {$nin: ['resource', 'session']}, origin: {$ne: null}, _locked: false}).lean()
  const grouped=lodash(blocks).groupBy(BLOCK_TYPE).mapValues(v => v.length)
  console.log(grouped.value())
  for (const block of blocks) {
    const actual=await countChildren(block._id)
    const expected=await countChildren(block.origin._id)
    const msg=`Block ${await getBlockHierarchyName(block)} should have ${expected} children but has ${actual}`
    const msgexists=`Origine inconnue pour ${await getBlockName(block)}`
    const originExists=await Block.exists({_id: block.origin._id})
    try {
      if (!originExists) {
        throw new Error(msgexists)
      }
      if (actual!=expected) {
        throw new Error(msg)
      }
    }
    catch(err) {
      console.log(err.message)
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
      console.log(`Incorrect children order for ${v[0].parent}:${orders}`)
    }
  })
  console.log('*'.repeat(10), 'END children order')
}

const fixModel = async () => {
  console.log('*'.repeat(10), 'START fix model')
  const parents=await Block.find({_locked: false, parent: null, type: {$ne: 'resource'}})
    .populate({path: 'children', populate: 'origin'}).lean()
  parents.forEach(p => {
    console.log('Before', p.type, p.name, p.children.length)
    if (p.children.some(c => !c.origin)) {
      throw new Error(`${p.id}/${c._id} has no origin`)
    }
  })
  const families=parents.map(p => ({type: p.type, id: p._id, name:p.name, children: p.children.map(c => c.origin._id)}))
  const grouped=lodash.groupBy(families, 'type')
  const types=['sequence', 'module', 'chapter', 'program']
  // Remove all clones
  await Block.remove({origin: {$ne: null}, _locked:false})

  const designer=await User.findOne({role: ROLE_CONCEPTEUR})
  const reAssociate = async blocks => {
    return Promise.all(blocks.map(({id, children}) => {
      console.log('Running', id, children)
      if (children.length==0) {
        return
      }
      return runPromisesWithDelay(children.map(child => async () => {
        console.log('start', id, child)
        const res=addChildAction({parent: id, child: child}, designer).catch(console.error)
        console.log('end', id, child)
        return res
      }))
      .then(res => {
        const err=res.find(r => r.status=='rejected')
        if (err) {
          throw new Error(r.reason)
        }
      })
    })
  )}
  await reAssociate(grouped.sequence)
  await reAssociate(grouped.module)
  await reAssociate(grouped.chapter)
  await reAssociate(grouped.program)
  const parentsAfter=await Block.find({_locked: false, parent: null, type: {$ne: 'resource'}})
    .populate('children')
  parentsAfter.forEach(p => {
    console.log('After', p.type, p.name, p.children.length)
  })
  console.log('*'.repeat(10), 'END fix model')
}

const checkConsistency = async () => {
  await mongoose.connect(getDatabaseUri(), MONGOOSE_OPTIONS)
  await checkChildrenPropagation()
  await checkChildrenOrder()
  await fixModel()
}

checkConsistency()
  .then(console.log)
  .catch(console.error)
  .finally(() => process.exit(0))
