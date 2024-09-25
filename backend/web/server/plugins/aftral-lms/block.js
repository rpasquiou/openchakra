const lodash = require("lodash");
const mongoose=require('mongoose')
const Progress = require("../../models/Progress")
const { 
  BLOCK_STATUS_CURRENT, BLOCK_STATUS_FINISHED, ACHIEVEMENT_RULE_CHECK, ROLE_CONCEPTEUR, ROLE_APPRENANT, ROLE_ADMINISTRATEUR, BLOCK_TYPE, 
  BLOCK_TYPE_SESSION, BLOCK_TYPE_PROGRAM, BLOCK_TYPE_CHAPTER, BLOCK_TYPE_MODULE, BLOCK_TYPE_SEQUENCE, BLOCK_TYPE_RESOURCE
} = require("./consts");
const { getBlockResources } = require("./resources");
const { idEqual, loadFromDb, getModel } = require("../../utils/database");
const SessionConversation = require("../../models/SessionConversation");

const LINKED_ATTRIBUTES_CONVERSION={
  name: lodash.identity,
  closed: v => v || false,
  masked: v => v || false,
  description: lodash.identity,
  picture: lodash.identity, 
  optional : v => v || false, 
  code: lodash.identity, 
  access_condition: v => v || false, 
  resource_type: v => v || undefined,
  homework_mode: lodash.identity,
  url: lodash.identity,
  evaluation: v => v || false,
  achievement_rule : v => v || undefined,
  success_note_min: lodash.identity,
  success_note_max: lodash.identity,
  success_scale: v=>v || false,
  max_attempts: lodash.identity,
  note: lodash.identity,
  scale: lodash.identity,
  correction: lodash.identity,
}

const LINKED_ATTRIBUTES=Object.keys(LINKED_ATTRIBUTES_CONVERSION)

const NULLED_ATTRIBUTES=Object.fromEntries(LINKED_ATTRIBUTES.map(att => ([att, undefined])))

const ensureMongooseModel = data => {
  if (data.constructor.name != 'model') {
    throw new Error(`Expecting mongoose object:`, JSON.stringify(data));
  }
}

const setParentSession = async (session_id) => {
  const allBlocks=await getSessionBlocks(session_id)
  return mongoose.models.block.updateMany({_id: {$in: allBlocks}}, {session: session_id})
}

const getSessionBlocks = async block => {
  if (!(block instanceof mongoose.Model)) {
    throw new Error(`Expecting mongoose object`)
  }
  const res=[block]
  if (block.children===undefined) {
    await block.populate('children').execPopulate()
  }
  const subChildren=await Promise.all(block.children.map(child => getSessionBlocks(child)))
  res.push(...lodash.flatten(subChildren))
  return res
}

const getParentBlocks = async blockId => {
  const res=[]
  let block=await mongoose.models.block.findById(blockId, {parent:1})
  while (block.parent) {
    res.push(block.parent._id)
    block=await mongoose.models.block.findById(block.parent, {parent:1})
  }
  return res
}

const getBlockStatus = async (userId, params, data) => {
  return (await Progress.findOne({ block: data._id, user: userId }))?.achievement_status
}

const cloneTree = async (blockId, parentId) => {
  if (!blockId || !parentId) {
    throw new Error(`childId and parentId are expected`)
  }
  const parentChildrenCount=await mongoose.models.block.countDocuments({parent: parentId})
  const newOrder=parentChildrenCount+1
  const block=await mongoose.models.block.findById(blockId).populate('children')
  let blockData={
    order: newOrder,
    ...lodash.omit(block.toObject(), ['id', '_id', 'origin', 'parent']),
    id: undefined, _id: undefined, origin: blockId, parent: parentId,
  }

  const newBlock=new mongoose.models.block({...blockData})
  await newBlock.save()
  let children=await Promise.all(block.children.map(childId => cloneTree(childId._id, newBlock._id)))
  newBlock.children=children.map(c => c._id)
  return newBlock.save()
}

const cloneTemplate = async (blockId, user) => {
  if (!blockId) {
    throw new Error(`blockId is expected`)
  }
  const block=await mongoose.models.block.findById(blockId).populate('children')
  const newName=`Copie de ${block.name}`
  let blockData={
    ...lodash.omit(block.toObject(), ['id', '_id', 'origin', 'parent']),
    id: undefined, _id: undefined, origin: null,
    name: newName,
  }

  const newBlock=new mongoose.models.block({...blockData})
  await newBlock.save()
  await Promise.all(block.children.map(child => addChild(user, newBlock._id, child.origin._id)))
}

// Loads the chain from blockId to its root origin
const loadChain = async blockId => {
  const result = await mongoose.models.block.aggregate([
    {
      $match: { _id: mongoose.Types.ObjectId(blockId) }
    },
    {
      $graphLookup: {
        from: 'blocks',
        startWith: '$_id',
        connectFromField: 'origin',
        connectToField: '_id',
        as: 'blockChain'
      }
    }
  ]);
  
  if (result.length === 0) {
    return []
  }

  // Combine the root block with its entire chain
  const rootBlock = result[0];
  const blockChain = [rootBlock, ...rootBlock.blockChain];

  // Sort the blocks to maintain the order based on their origin
  const blockMap = {};
  blockChain.forEach(block => {
    blockMap[block._id.toString()] = block;
  });

  const sortedBlocks = [];
  let currentBlock = rootBlock;

  while (currentBlock) {
    sortedBlocks.push(currentBlock);
    currentBlock = currentBlock.origin ? blockMap[currentBlock.origin.toString()] : null;
  }

  return sortedBlocks;

}

const isFinished = async (user, block) => {
  return Progress.exists({user, block, achievement_status: BLOCK_STATUS_FINISHED})
}

const onBlockFinished = async (user, block) => {
  ensureMongooseModel(block)
  await block.populate('parent').execPopulate()
  if (!block.parent) {
    return
  }
  await block.parent.populate('children').execPopulate()
  const allChildrenFinished = (await Promise.all(block.parent.children.map(c => isFinished(user, c)))).every(v => !!v)

  if (allChildrenFinished) {
    await Progress.findOneAndUpdate(
      {block: block.parent, user},
      {block: block.parent, user, achievement_status: BLOCK_STATUS_FINISHED},
      {upsert: true}
    )
    await onBlockFinished(user, block.parent)
  }
}

// Set all parents to current
const onBlockCurrent = async (user, block) => {
  ensureMongooseModel(block)
  await block.populate('parent').execPopulate()
  if (block.parent) {
    await Progress.findOneAndUpdate(
      {block: block.parent._id, user},
      {block: block.parent._id, user, achievement_status: BLOCK_STATUS_CURRENT},
      {upsert: true}
    )    
    return onBlockCurrent(user, block.parent)
  }
}

const onBlockAction = async (user, block) => {
  const progress=await Progress.findOne({user, block})
  const rule=block.achievement_rule
  console.log('rule is', rule)
  const finished=ACHIEVEMENT_RULE_CHECK[rule](progress)
  const status=finished ? BLOCK_STATUS_FINISHED : BLOCK_STATUS_CURRENT
  await Progress.findOneAndUpdate(
    {block, user},
    {block, user, achievement_status: status},
    {upsert: true}
  )
  if (finished) {
    console.log(`Block ${block._id} finished`)
    onBlockFinished(user, block)
  }
  else {
    console.log(`Block ${block._id} becomes current`)
    onBlockCurrent(user, block)
  }
}

// Return the session for this block
const getBlockSession = async blockId => {
  const block=await mongoose.models.block.findById(blockId, {type:1, parent:1})
  if (block.type=='session') {
    return block._id
  }
  if (!block.parent) {
    throw new Error(`${blockId}: no session found and no parent`)
  }
  return getBlockSession(block.parent)
}

const getNextResource= async (blockId, user) => {
  const session=await getBlockSession(blockId)
  const resources=await getBlockResources(session)
  const brothers=lodash.dropWhile(resources, id => !idEqual(id, blockId)).slice(1)
  if (!brothers[0]) {
    throw new Error('Pas de ressource suivante')
  }
  return {_id: brothers[0]}
}

const getPreviousResource= async (blockId, user) => {
  const session=await getBlockSession(blockId)
  let resources=await getBlockResources(session)
  resources.reverse()
  const brothers=lodash.dropWhile(resources, id => !idEqual(id, blockId)).slice(1)
  if (!brothers[0]) {
    throw new Error('Pas de ressource précédente')
  }
  return {_id: brothers[0]}
}

const getSession = async (userId, params, data, fields) => {
  let currentBlock = await mongoose.models.block.findById(data._id,{parent:1, type:1})
  while (!!currentBlock.parent) {
    currentBlock = await mongoose.models.block.findById(currentBlock.parent,{parent:1, type:1})
  }
  const model = await getModel(currentBlock._id)
  if(model != `session`) {
    return {}
  }
  const [result] = await loadFromDb({model: 'block', id:currentBlock._id, fields, user:userId})
  return result
}

const getBlockLiked = async (userId, params, data) => {
  const user = await mongoose.models.user.findById(userId, {role:1})
  const template = await getTemplate(data._id)
  if(user.role == ROLE_CONCEPTEUR) {
    return template._liked_by.length > 0
  }
  return template._liked_by.some(like => idEqual(like, userId))
}

const getBlockDisliked = async (userId, params, data) => {
  const user = await mongoose.models.user.findById(userId, {role:1})
  const template = await getTemplate(data._id)
  if(user.role == ROLE_CONCEPTEUR) {
    return template._disliked_by.length > 0
  }
  return template._disliked_by.some(dislike => idEqual(dislike, userId))
}

const setBlockLiked = async ({ id, attribute, value, user }) => {
  const template = await getTemplate(id)
  if(value) {
    return mongoose.models['block'].findByIdAndUpdate(template._id,
      {
        $pull: {
          _disliked_by: user._id
        }, 
        $addToSet: {
          _liked_by: user._id
        }
      }
    )
  }
  else{
    return mongoose.models['block'].findByIdAndUpdate(template._id,
      {$pull: {_liked_by: user._id}})
  }
}

const setBlockDisliked = async ({ id, attribute, value, user }) => {
  const template = await getTemplate(id)
  if(value) {
    return mongoose.models['block'].findByIdAndUpdate(template._id,
      {
        $pull: {
          _liked_by: user._id
        }, 
        $addToSet: {
          _disliked_by: user._id
        }
      }
    )
  }
  else{
    return mongoose.models['block'].findByIdAndUpdate(template._id,
      {$pull: {_disliked_by: user._id}})
  }
}

const getTemplate = async (id) => {
  let block=await mongoose.models.block.findById(id, {origin:1, _liked_by:1, _disliked_by:1})
  if (!block.origin) {
    return block
  }
  return await getTemplate(block.origin)
}

const getAvailableCodes =  async (userId, params, data) => {
  if(data.type != 'program') {
    return []
  }
  let otherPrograms=await mongoose.models.block.find({_id: {$ne: data._id}, type:'program'}).populate('codes')
  const usedCodes=lodash(otherPrograms).map(p => p.codes).flatten().map(c => c.code).value()
  let availableCodes=await mongoose.models.productCode.find({code: {$nin: usedCodes}})
  return availableCodes
}

const getBlockHomeworks = async (userId, params, data, displayFields, actualLogged) => {
  const isTrainee=await mongoose.models.user.exists({_id: actualLogged, role: ROLE_APPRENANT})
  const filter=isTrainee ?  {resource: data._id, trainee: userId} : {resource: data._id}
  const homeworks=await mongoose.models.homework.find(filter)
    .populate(['trainee', 'resource'])
  return homeworks
}

const getBlockHomeworksSubmitted = async (userId, params, data) => {
  const progress = await mongoose.models.progress.find({
    block:data._id
  }).populate('homeworks')
  const homeworks = progress.filter(p=> p.homeworks.length>0)
  return homeworks.length
}

const getBlockHomeworksMissing = async (userId, params, data) => {
  const session = await mongoose.models.session.findById(data.session)
  const progress = await mongoose.models.progress.find({
    block:data._id
  }).populate('homeworks')
  const homeworks = progress.filter(p=> p.homeworks.length>0)
  const result = session.trainees.length - homeworks.length
  return result
}

const getBlockTraineesCount = async (userId, params, data) => {
  const session = await mongoose.models.session.findById(data.session)
  return session.trainees ? session.trainees.length : 0
}

const getBlockFinishedChildren = async (userId, params, data, fields) => {
  const proccessedFields = fields.map(f => `block.` + f)
  proccessedFields.push(`user`)
  proccessedFields.push(`achievement_status`)

  const loadedProgresses = await loadFromDb({
    model: `progress`,
    fields: proccessedFields,
  })

  if (loadedProgresses.length == 0) {
    return null
  }

  const finishedChildren = loadedProgresses.filter(
    p => p.user && idEqual(p.user._id, userId) && p.achievement_status === BLOCK_STATUS_FINISHED
  ).map(p => p.block)

  if (finishedChildren.length == 0) {
    return null
  }

  return finishedChildren
}

const getSessionConversations = async (userId, params, data, fields) => {
  const user = await mongoose.models.user.findById(userId)
  const convs = await SessionConversation.find({
    session: data._id,
    ...user.role == ROLE_APPRENANT ? {trainee:user._id} : {}

  })
  const newParams = {}
  const convIds = convs.map(c=>c._id)
  newParams[`filter._id`] = {$in:convIds}
  let res = await loadFromDb({
    model: `sessionConversation`,
    params:newParams,
    fields,
    user
  })
  res = res.map(r=> new SessionConversation(r))
  return res
}

const propagateAttributes=async (blockId, attributes=null) => {
  if (attributes && attributes.length==0) {
    return
  }
  const is_template=attributes==null
  if (is_template) {
    console.time(`Propagating for ${blockId}`)
  }
  const block=await mongoose.models.block.findById(blockId)
  if (attributes==null) {
    attributes=lodash(block.toObject()).pick(LINKED_ATTRIBUTES).value()
    attributes=lodash.mapValues(attributes, (v, k) => LINKED_ATTRIBUTES_CONVERSION[k](v))
  }
  else {
    const forced=block._forced_attributes || []
    attributes=lodash.omit(attributes, forced)
    // console.log('Setting', blockId, 'attributes', attributes)
    Object.assign(block, attributes)
    await block.save().catch(err => {
      console.error('Block', blockId, attributes, err)
      throw err
    })
  }
  const ancestors=await mongoose.models.block.find({origin: blockId}, {_id:1})
  await Promise.all(ancestors.map( a => propagateAttributes(a._id, attributes)))
  if (is_template) {
    console.timeEnd(`Propagating for ${blockId}`)
  }
}

const getBlockTicketsCount = async (userId, params, data) => {
  const ids = [data._id]
  if(data.is_template) {
    const allDependants = await data.getDependants()
    allDependants.map(dep => ids.push(dep._id))
  }
  const count = await mongoose.models.ticket.countDocuments({block:{$in:ids}})
  return count
}

const updateChildrenOrder = async parentId => {
  const children=await mongoose.models.block.find({parent: parentId}).sort({order:1})
  await Promise.all(children.map((child, idx) => {
    child.order=idx+1
    return child.save()
  }))
}

const addChild = async (user, parent, child) => {
  // Allow ADMIN to add child for session import
  if (![ROLE_ADMINISTRATEUR, ROLE_CONCEPTEUR].includes(user.role)) {
    throw new ForbiddenError(`Forbidden for role ${ROLES[user.role]}`)
  }
  [parent, child] = await Promise.all([parent, child].map(id => mongoose.models.block.findById(id, { [BLOCK_TYPE]: 1 }).lean()))
  const [pType, cType] = [parent?.type, child?.type]
  if (!pType || !cType) { throw new Error('program/module/sequence/ressource attendu')} 
  if (!!parent.origin) {
    throw new Error(`Le parent doit être un template`)
  }
  if (!!child.origin) {
    throw new Error(`Le fils doit être un template`)
  }
  if (!acceptsChild(pType, cType)) { throw new Error(`${cType} ne peut être ajouté à ${pType}`)} 
  const createdChild = await cloneTree(child._id, parent._id)
  await mongoose.models.block.findByIdAndUpdate(parent, { last_updater: user })

  // Now propagate to all origins
  const origins = await mongoose.models.block.find({ origin: parent._id }, { _id: 1 })
  await Promise.all(origins.map(origin => addChild(user, origin._id, createdChild._id)))
}

const ACCEPTS={
  [BLOCK_TYPE_SESSION]: [BLOCK_TYPE_PROGRAM],
  [BLOCK_TYPE_PROGRAM]: [BLOCK_TYPE_CHAPTER, BLOCK_TYPE_MODULE],
  [BLOCK_TYPE_CHAPTER]: [BLOCK_TYPE_MODULE],
  [BLOCK_TYPE_MODULE]: [BLOCK_TYPE_SEQUENCE],
  [BLOCK_TYPE_SEQUENCE]: [BLOCK_TYPE_RESOURCE]
}

const acceptsChild= (pType, cType) => {
  return ACCEPTS[pType]?.includes(cType)
}

module.exports={
  getBlockStatus, getSessionBlocks, setParentSession, 
  cloneTree, LINKED_ATTRIBUTES, onBlockFinished, onBlockCurrent, onBlockAction,
  getNextResource, getPreviousResource, getParentBlocks,LINKED_ATTRIBUTES_CONVERSION,
  getSession, getBlockLiked, getBlockDisliked, setBlockLiked, setBlockDisliked,
  getAvailableCodes, getBlockHomeworks, getBlockHomeworksSubmitted, getBlockHomeworksMissing, getBlockTraineesCount,
  getBlockFinishedChildren, getSessionConversations, propagateAttributes, getBlockTicketsCount,
  updateChildrenOrder, cloneTemplate,addChild, acceptsChild,
}

