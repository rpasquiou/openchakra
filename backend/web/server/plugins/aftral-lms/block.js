const AdmZip = require('adm-zip')
const mime=require('mime-types')
const path=require('path')
const lodash = require("lodash");
const moment = require("moment");
const mongoose=require('mongoose')
const Progress = require("../../models/Progress")
const { BLOCK_STATUS_CURRENT, BLOCK_STATUS_FINISHED, BLOCK_STATUS_TO_COME, BLOCK_STATUS_UNAVAILABLE, ACHIEVEMENT_RULE_CHECK, ROLE_CONCEPTEUR, ROLE_APPRENANT, ROLE_ADMINISTRATEUR, BLOCK_TYPE, BLOCK_TYPE_RESOURCE, BLOCK_TYPE_SESSION, SCALE_ACQUIRED, RESOURCE_TYPE_SCORM, SCALE, BLOCK_STATUS, SCORM_STATUS_PASSED, SCORM_STATUS_FAILED, SCORM_STATUS_COMPLETED, BLOCK_TYPE_SEQUENCE, BLOCK_TYPE_PROGRAM, BLOCK_TYPE_CHAPTER, BLOCK_TYPE_MODULE, BLOCK_TYPE_LABEL } = require("./consts");
const { getBlockResources, getBlockChildren } = require("./resources");
const { idEqual, loadFromDb, getModel } = require("../../utils/database");
const User = require("../../models/User");
const SessionConversation = require("../../models/SessionConversation");
const Homework = require("../../models/Homework");
const { BadRequestError } = require("../../utils/errors");
const { CREATED_AT_ATTRIBUTE } = require("../../../utils/consts");
const { sendBufferToAWS } = require("../../middlewares/aws");
const { fillForm2 } = require("../../../utils/fillForm");
const { formatDate, formatPercent } = require('../../../utils/text');
const { ensureObjectIdOrString } = require('./utils');
const { getSessionTraineeVisio } = require('./visio');
const ROOT = path.join(__dirname, `../../../static/assets/aftral_templates`)
const TEMPLATE_NAME = 'template justificatif de formation.pdf'

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
  external: v=>v || false,
}

const LINKED_ATTRIBUTES=Object.keys(LINKED_ATTRIBUTES_CONVERSION)

const NULLED_ATTRIBUTES=Object.fromEntries(LINKED_ATTRIBUTES.map(att => ([att, undefined])))

const ensureMongooseModel = data => {
  if (data.constructor.name != 'model') {
    throw new Error(`Expecting mongoose object:`, JSON.stringify(data));
  }
}

// Returns the top-level parent of this block
const getTopParent = async blockId => {
  const block=await mongoose.models.block.findById(blockId)
  if (!block.parent) {
    return block
  }
  return getTopParent(block.parent)
}

const getProgress = async (userId, blockId) => {
  return mongoose.models.progress.findOne({user: userId, block: blockId})
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
  if (data?.type=='session') {
    const finished=await mongoose.models.session.exists({_id: data._id, end_date: {$lt: moment()}})
    if (finished) {
      return BLOCK_STATUS_FINISHED
    }
  }
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
  await Promise.all(block.children.map(child => addChild({parent: newBlock._id, child: child.origin._id, user})))
  return newBlock
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
  return Progress.exists({user: user._id, block: block._id, achievement_status: BLOCK_STATUS_FINISHED})
}

const checkAccessCondition = async (user, blockId) => {
  const bl=await mongoose.models.block.findById(blockId)
  const brother=await mongoose.models.block.findOne({parent: bl.parent, order: bl.order+1, access_condition: true})
  if (brother) {
    const brotherState=await getBlockStatus(user, null, {_id: brother._id})
    if (brotherState!=BLOCK_STATUS_FINISHED) {
      await saveBlockStatus(user, brother._id, BLOCK_STATUS_TO_COME)
    }
  }
}

const onBlockFinished = async (user, block) => {
  await saveBlockStatus(user, block, BLOCK_STATUS_FINISHED)
  const session=await getBlockSession(block)
  return updateSessionStatus(session._id, user._id)
}

const onBlockAction = async (userId, blockId) => {
  await ensureObjectIdOrString(userId)
  await ensureObjectIdOrString(blockId)
  const bl=await mongoose.models.block.findById(blockId)
  // TODO : Finish if homework succeeded AND rule is "Success" or "Success or finished"
  // Homework priority on other rules
  if (bl.homework_mode) {
    const homeworks=await Homework.find({trainee: userId, resource: blockId}).sort({[CREATED_AT_ATTRIBUTE]: 1})
    const latest_homework=lodash.last(homeworks)
    if (!!latest_homework) {
      if ((bl.success_scale && latest_homework.scale==SCALE_ACQUIRED)
      ||!bl.success_scale && latest_homework.note>=bl.success_note_min) {
      if (!(await isFinished(userId, blockId))) {
          await saveBlockStatus(userId, blockId, BLOCK_STATUS_FINISHED)
          return onBlockFinished(userId, blockId)
        }
      }
    }
  }
  const progress=await Progress.findOne({user: userId, block: blockId})
  const rule=bl.achievement_rule
  const prevStatus=progress.achievement_status
  const finished=ACHIEVEMENT_RULE_CHECK[rule](progress)
  const newStatus=finished ? BLOCK_STATUS_FINISHED : BLOCK_STATUS_CURRENT
  if (prevStatus != newStatus) {
    await saveBlockStatus(userId, blockId, newStatus)
    if (newStatus==BLOCK_STATUS_FINISHED) {
      onBlockFinished(userId, blockId)
    }
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
  const session=await getBlockSession(blockId, user)
  const resources=await getBlockResources({blockId: session, userId: user, includeUnavailable: false, includeOptional: true})
  const idx=resources.findIndex(r => idEqual(r._id, blockId))
  if ((idx+1)>=resources.length) {
    throw new Error('Pas de ressource suivante')
  }
  return {_id: resources[idx+1]._id}
}

const getPreviousResource= async (blockId, user) => {
  const session=await getBlockSession(blockId, user)
  const resources=await getBlockResources({blockId: session, userId: user, includeUnavailable: false, includeOptional: true})
  const idx=resources.findIndex(r => idEqual(r._id, blockId))
  if (idx==0) {
    throw new Error('Pas de ressource précédente')
  }
  return {_id: resources[idx-1]._id}
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
  const user = await User.findById(userId, {role:1})
  const template = await getTemplate(data._id)
  if(user.role == ROLE_CONCEPTEUR) {
    return template._liked_by.length > 0
  }
  return template._liked_by.some(like => idEqual(like, userId))
}

const getBlockDisliked = async (userId, params, data) => {
  const user = await User.findById(userId, {role:1})
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
  const bl=await mongoose.models.block.findById(id)
  if (!bl.origin && !bl._locked && !bl.parent) {
    return bl
  }
  return await mongoose.models.block.findOne({name: bl.name, origin: null, _locked: {$ne: true}, parent: null})
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
  const isTrainee=await User.exists({_id: actualLogged, role: ROLE_APPRENANT})
  const filter=isTrainee ?  {resource: data._id, trainee: userId} : {resource: data._id}
  const homeworks=await Homework.find(filter)
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
  return session?.trainees?.length || 0
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

const getFinishedChildrenCount = async (userId, params, data, fields) => {
  const children=await mongoose.models.block.find({parent: data._id, masked:{$ne: true}}, {_id: 1})
  const finished=await Progress.countDocuments({block: {$in: children}, user: userId, achievement_status: BLOCK_STATUS_FINISHED})
  return finished
}

const getSessionConversations = async (userId, params, data, fields) => {
  const user = await User.findById(userId)
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

const getSessionProof = async (userId, params, data, fields, actualLogged) => {
  
  const actualLoggedUser=await User.findById(actualLogged)
  if (actualLoggedUser?.role==ROLE_APPRENANT) {
    console.warn(`Session proof forbidden for trainee ${actualLoggedUser.email}`)
    return null
  }

  const locations=await Promise.all(data.trainees.map(async trainee => {

    const sessionFields=[
      'name', 'start_date', 'end_date', 'code', 'location', 'achievement_status', 'order', 'spent_time_str', 'resources_progress', '_trainees_connections',
      'children.order', 'children.name', 'children.resources_progress', 'children.spent_time_str', 
      'children.children.order', 'children.children.name', 'children.children.resources_progress', 'children.children.spent_time_str', 
      'children.children.children.order', 'children.children.children.name', 'children.children.children.resources_progress', 'children.children.children.spent_time_str',
      'children.children.children.children.name', 'children.children.children.children.resources_progress', 'children.children.children.children.spent_time_str',
      'children.children.children.children.children.name', 'children.children.children.children.children.resources_progress', 'children.children.children.children.children.spent_time_str',
    ]

    const [session]=await loadFromDb({model: 'session', id: data._id, fields: sessionFields, user: trainee._id})

    const firstConnection=session._trainees_connections.find(tc => idEqual(tc.trainee._id, trainee.id))?.date

    let pdfData={
      start_date: formatDate(session.start_date, true), end_date: formatDate(session.end_date, true), location: session.location,
      session_name: session.name, trainee_fullname: trainee.fullname, session_code: session.code,
      achievement_status: BLOCK_STATUS[session.achievement_status], creation_date: formatDate(moment(), true),
      spent_time_str: `Temps total du parcours : ${session.spent_time_str}`, resources_progress: formatPercent(session.resources_progress),
      first_connection: firstConnection ? formatDate(firstConnection, true) : undefined,
      level_1:session.children[0].children.map(c => ({
        resources_progress: formatPercent(c.resources_progress),
        name: c.name, spent_time_str: c.spent_time_str,
        level_2: c.children.map(c2 => ({
          name: c2.name, spent_time_str: c2.spent_time_str, order: c2.order.toString(),
          level_3: c2.children.map(c3 => ({
            name: c3.name, spent_time_str: c3.spent_time_str,
            level_4: c3.children.map(c4 => ({
              name: c4.name, spent_time_str: c4.spent_time_str
            }))
  
          }))
        }))
      }))
    }

    const virtualClasses=await getSessionTraineeVisio(data._id, trainee._id)

    // Add virtual classes
    if (virtualClasses.length>0) {
      pdfData.level_1=[...pdfData.level_1, {name:''}, {name: 'Classes virtuelles', level_2: virtualClasses}]
    }
    
    const pdfPath=path.join(ROOT, TEMPLATE_NAME)
    const pdf=await fillForm2(pdfPath, pdfData).catch(console.error)
    const buffer=await pdf.save()
    const filename=`${data.code}-${trainee.fullname}.pdf`
    const  {Location}=await sendBufferToAWS({filename, buffer, type: 'proof', mimeType: mime.lookup(filename)}).catch(console.error)
    return {filename: filename, buffer, locaiton: Location}
  }))

  // Generate a zip
  const zip=new AdmZip()
  locations.map(({filename, buffer}) => {
    zip.addFile(filename, buffer)
  })
  const buffer=zip.toBuffer()
  const filename=`Justificatifs-${data.code}.zip`
  const {Location}=await sendBufferToAWS({filename, buffer, type: 'certificates', mimeType: mime.lookup(filename)}).catch(console.error)
  return Location
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

const ACCEPTS={
  session: ['program'],
  program: ['chapter', 'module'],
  chapter: ['module'],
  module: ['sequence'],
  sequence: ['resource'],
}

const acceptsChild= async (parent, child) => {
  if (!ACCEPTS[parent.type]?.includes(child.type)) {
    throw new Error(`${child.type_str} ne peut être ajouté à ${parent.type_str}`)
  }
  // Can't mix modules and chapters in a program
  if (parent.type==BLOCK_TYPE_PROGRAM) {
    const otherType=child.type==BLOCK_TYPE_CHAPTER ? BLOCK_TYPE_MODULE : BLOCK_TYPE_CHAPTER
    const hasOtherType=await mongoose.models.block.exists({parent: parent._id, type: otherType})
    if (hasOtherType) {
      throw new Error(`${child.type_str} et ${BLOCK_TYPE_LABEL[otherType]} sont incompatibles dans un programme`)
    }
  }
}

/**
 * Only template can be added to template only
 * Don't check that when propagating to origins
 */
const addChild = async ({parent, child, user, check=true}) => {
  // Allow ADMIN to add child for session import
  if (![ROLE_ADMINISTRATEUR, ROLE_CONCEPTEUR].includes(user.role)) {
    throw new ForbiddenError(`Forbidden for role ${ROLES[user.role]}`)
  }
  [parent, child] = await Promise.all([parent, child].map(id => mongoose.models.block.findById(id)))
  const [pType, cType]=[parent?.type, child?.type]
  if (!pType || !cType) { throw new Error('program/module/sequence/ressource attendu')}
  if (check && !!parent.origin) {
    throw new BadRequestError(`Le parent doit être un template`)
  }
  if (check && !!child.origin) {
    throw new BadRequestError(`Le fils doit être un template`)
  }
  await acceptsChild(parent, child)
  const createdChild = await cloneTree(child._id, parent._id)
  await mongoose.models.block.findByIdAndUpdate(parent, {last_updater: user})

  // Now propagate to all origins
  const origins=await mongoose.models.block.find({origin: parent._id, _locked: false}, {_id:1})
  await Promise.all(origins.map(origin => addChild({parent: origin._id, child: createdChild._id, user, check: false})))
}

const lockSession = async blockId => {
  const session = await mongoose.models.block.findById(blockId).populate('children').populate('trainees')
  if (!session || session.type!=BLOCK_TYPE_SESSION) {
    throw new Error(`${blockId} null or not session:${session?.type}/${session.name}`)
  }
  if (lodash.isEmpty(session.trainees)) {
    throw new BadRequestError(`Démarrage session ${session.code} impossible: pas d'apprenant`)
  }
  if (lodash.isEmpty(session.children)) {
    throw new BadRequestError(`Démarrage session ${session.code} impossible: pas de programme`)
  }
  console.log('Locking session', blockId, 'trainees', session.trainees.map(t => [t._id, t.email]))
  const trainees=session.trainees
  const toManage=[session]
  while (toManage.length>0) {
    let block=toManage.pop()
    console.log('Manage block', block._id, block.name)
    // Set default block availability
    await Promise.all(trainees.map(async t => {
      if (!(await Progress.exists({block: block._id, user: t._id}))) {
        const defaultStatus=block.access_condition ? BLOCK_STATUS_UNAVAILABLE : BLOCK_STATUS_TO_COME
        await saveBlockStatus(t._id, block._id, defaultStatus)
      }
    }))
    if (!block) {
      throw new Error('blcok numm')
    }
    const children=await mongoose.models.block.find({parent: block._id})
    block._locked=true
    await block.save().catch(err => {
      err.message=`${block._id}:${err}`
      throw err
    })
    toManage.push(...children)
  }
  setSessionInitialStatus(session._id, session.trainees.map(t => t._id))
}

const setSessionInitialStatus = async blockId => {
  return updateSessionStatus(blockId)
}

const hasParentMasked = async (blockId) => {
  const block=await mongoose.models.block.findById(blockId, {masked: true}).lean({virtuals: false})
  return block.masked || (block.parent && hasParentMasked(block.parent))
}

const saveBlockStatus= async (userId, blockId, status, withChildren) => {
  if (!userId || !blockId || !status) {
    throw new Error(userId, blockId, status)
  }
  ensureObjectIdOrString(userId)
  ensureObjectIdOrString(blockId)

  // Alert if optional block was set to UNAVAILABLE
  const optional=(await mongoose.models.block.findById(blockId))?.optional
  if (!!optional && status==BLOCK_STATUS_UNAVAILABLE) {
    return getBlockStatus(userId, null, {_id: blockId})
  }
  const before=await Progress.findOneAndUpdate(
    {block: blockId, user: userId},
    {block: blockId, user: userId, achievement_status: status},
    {upsert: true}
  )
  const statusChanged=before?.achievement_status!==status
  if (statusChanged && withChildren) {
    const children=await mongoose.models.block.find({ parent: blockId})
    if (children.length>0) {
      await Promise.all(children.map(child => saveBlockStatus(userId, child._id, status, withChildren)))
    }
  }
  return status
}

const saveBlockScormData = async (userId, blockId, data) => {
  if (!userId || !blockId || !data) {
    throw new Error(userId, blockId, data)
  }
  await Progress.findOneAndUpdate(
    {block: blockId, user: userId},
    {block: blockId, user: userId, scorm_data: JSON.stringify(data)},
    {upsert: true})
}

const getBlockScormData = async (userId, blockId) => {
  if (!userId || !blockId) {
    throw new Error(userId, blockId)
  }
  const pr=await Progress.findOne({block: blockId, user: userId})
  if (pr?.scorm_data) {
    return JSON.parse(pr.scorm_data)
  }
}

const removeBlockStatus= async (userId, blockId, status) => {
  if (!userId || !blockId) {
    throw new Error(userId, blockId, status)
  }
  return Progress.remove({block: blockId, user: userId})
}

const computeBlockStatus = async (blockId, isFinishedBlock, setBlockStatus, locGetBlockStatus) => {
  const block = await mongoose.models.block.findById(blockId).populate('children')
  const blockStatus=await locGetBlockStatus(blockId)
  if (block.type==BLOCK_TYPE_RESOURCE) {
    if (block.status==BLOCK_STATUS_FINISHED) {
      return block.status
    }
    if (block.access_condition && block.order>1) {
      const prevBrother=await mongoose.models.block.findOne({parent: block.parent, order: block.order-1})
      const prevStatus=await locGetBlockStatus(prevBrother._id)
      if (!prevStatus) {
        console.error(`Coudld not find status for brother`, prevBrother._id)
      }
      if (prevStatus==BLOCK_STATUS_FINISHED) {
        if (blockStatus==BLOCK_STATUS_UNAVAILABLE) {
          return setBlockStatus(block._id, BLOCK_STATUS_TO_COME)
        }
      }
      else {
        return setBlockStatus(block._id, BLOCK_STATUS_UNAVAILABLE)
      }
    }
    if (lodash.isNil(blockStatus)) {
      return setBlockStatus(block._id, BLOCK_STATUS_TO_COME)
    }
    return blockStatus
  }
  const childrenStatus=await Promise.all(block.children.map(c => computeBlockStatus(c._id, isFinishedBlock, setBlockStatus, locGetBlockStatus)))
  // Check finished for non-optional only
  const mandatoryChildrenStatus = lodash(childrenStatus).filter((_, idx) => !block.children[idx].optional).uniq();
  const allChildrenFinished=mandatoryChildrenStatus.isEmpty() || mandatoryChildrenStatus.isEqual([BLOCK_STATUS_FINISHED])

  // Block finished if all children finished
  if (allChildrenFinished) {
    return setBlockStatus(block._id, BLOCK_STATUS_FINISHED)
  }
  // If one child finished, next is available
  if (block.closed) {
    console.log(block.type, block.name, 'is closed')
    const lastFinished=lodash.findLastIndex(childrenStatus, s => s==BLOCK_STATUS_FINISHED)
    if (lastFinished<block.children.length-1) {
      const brother=block.children[lastFinished+1]
      await setBlockStatus(brother._id, BLOCK_STATUS_TO_COME)
      // Next children are unavailable
      await Promise.all(lodash.range(lastFinished+2, block.children.length).map(idx => setBlockStatus(block.children[idx]._id, BLOCK_STATUS_UNAVAILABLE, true)))
    }
    return blockStatus
  }

  await Promise.all(block.children.map((c,idx) => (!childrenStatus[idx] || childrenStatus[idx]==BLOCK_STATUS_UNAVAILABLE) ?  setBlockStatus(c._id, BLOCK_STATUS_TO_COME) : null))
  return setBlockStatus(block._id, BLOCK_STATUS_TO_COME)
};


const updateSessionStatus = async (sessionId, trainee) => {
  console.time('update session status')
  const session=await mongoose.models.session.findById(sessionId)
  const trainees=!!trainee ? [trainee] : session.trainees
  await Promise.all(trainees.map(async t => {
    const isFinishedBlock = async blockId => isFinished(t._id, blockId)
    const setBlockStatus = (blockId, status, withChildren) => saveBlockStatus(t._id, blockId, status, withChildren)
    const locGetBlockStatus = (blockId) => getBlockStatus(t._id, null, {_id: blockId})
    await computeBlockStatus(sessionId, isFinishedBlock, setBlockStatus, locGetBlockStatus)
  }))
  console.timeEnd('update session status')
}

const setScormData= async (userId, blockId, data) => {
  await saveBlockScormData(userId, blockId, data)
  const block=await mongoose.models.block.findById(blockId)
  console.log(userId, blockId, 'Scorm got data', JSON.stringify({...data, scorm_data: undefined, suspend_data: undefined}, null, 2))
  const scormData=await getBlockScormData(userId, block)
  const lesson_status=scormData?.['cmi.core.lesson_status']
  // If a min note is defined on the resource, use it
  const hasNote=!!scormData?.['cmi.core.score.raw']
  // #212 Validate if note is egal to success min
  const scormMinNoteReached=!!block.success_note_min && parseInt(scormData?.['cmi.core.score.raw']) >= block.success_note_min
  const update={
    success: lesson_status==SCORM_STATUS_PASSED || scormMinNoteReached,
    finished: [SCORM_STATUS_PASSED, SCORM_STATUS_FAILED, SCORM_STATUS_COMPLETED].includes(lesson_status) || hasNote,
  }
  await Progress.findOneAndUpdate(
    {block, user: userId},
    {block, user: userId, ...update},
    {upsert: true},
  )
  await onBlockAction(userId, blockId)
}

const getBlockNote = async (userId, params, data) => {
  if (data.type!=BLOCK_TYPE_RESOURCE) {
    return undefined
  }
  const isTrainee=await User.exists({_id: userId, role: ROLE_APPRENANT})
  if (!isTrainee) {
    return undefined
  }
  if (!!data.homework_mode) {
    const homeworks=await Homework.find({resource: data._id, trainee: userId})
    const note=lodash.max(homeworks.map(h => h.note))
    return note
  }
  else if (data.resource_type==RESOURCE_TYPE_SCORM) {
    const scormData=await getBlockScormData(userId, data._id)
    return scormData?.['cmi.core.score.raw'] || undefined
  }
  else {
    return (await getProgress({user: userId, block: data._id}))?.note || null
  }
}

const setBlockNote = async ({ id, attribute, value, user }) => {
  const bl=await mongoose.models.block.findById(id)
  if (!lodash.inRange(value, 0, bl.success_note_max+1)) {
    throw new BadRequestError(`La note doit être comprise ente 0 et ${bl.success_note_max}`)
  }
  if (!!bl.homework_mode) {
    throw new BadRequestError(`La note doit être mise sur un devoir`)
  }
  pr = await getProgress({user, id})
  pr.note=value
  return pr.save()
}

const getBlockNoteStr = async (userId, params, data) => {
  if (data.type!=BLOCK_TYPE_RESOURCE) {
    return undefined
  }
  if (data.success_scale) {
    let scaleStr=null
    if (!!data.homework_mode) {
      const homeworks=await Homework.find({resource: data._id, trainee: userId})
      const scale=homeworks.find(h => !!h.scale)?.scale
      scaleStr=SCALE[scale]
    }
    return scaleStr
  }
  const note=await getBlockNote(userId, params, data)
  if (note) {
    return `${note}/${data.success_note_max}`
  }
}

// A program in produciton mode must not have a sequence with no resource
const ensureValidProgramProduction = async programId => {
  const childrenId=await getBlockChildren({blockId: programId})
  const children=await mongoose.models.block.find({_id: {$in: childrenId}})
  const sequences=children.filter(c => c.type==BLOCK_TYPE_SEQUENCE)

  // Forbid sequences with no resource
  await Promise.all(sequences.map(sequence => {
    return mongoose.models.block.find({parent: sequence._id}).orFail(new Error(`Passage en production interdit: la séquence ${sequence.name} n'a pas de ressource`))
  }))

  // #231: Forbid mandatory blocks whose all children are optional
  const forbidden=lodash(children)
    .groupBy(c => c.parent._id?.toString())
    .pickBy(v => !lodash.isEmpty(v) && v.every(subChild => !!subChild.optional))
  if (!forbidden.isEmpty()) {
    const msg=forbidden.keys().map(k => {
      parent=children.find(c => idEqual(c._id, k))
      return !parent.optional && `${BLOCK_TYPE_LABEL[parent.type]} "${parent.name}" doit être facultatif car tous ses enfants le sont`
    }).filter(Boolean).join(', ')
    if (!lodash.isEmpty(msg)) {
      throw new BadRequestError(msg)
    }
  }
}

const getFilteredTrainee = async (userId, params, data) => {
  if (data.trainees.some(t => idEqual(t._id, userId))) {
    return [await User.findById(userId)]
  }
}

module.exports={
  getBlockStatus, getSessionBlocks, setParentSession, 
  cloneTree, LINKED_ATTRIBUTES, onBlockFinished, onBlockAction,
  getNextResource, getPreviousResource, getParentBlocks,LINKED_ATTRIBUTES_CONVERSION,
  getSession, getBlockLiked, getBlockDisliked, setBlockLiked, setBlockDisliked,
  getAvailableCodes, getBlockHomeworks, getBlockHomeworksSubmitted, getBlockHomeworksMissing, getBlockTraineesCount,
  getBlockFinishedChildren, getSessionConversations, propagateAttributes, getBlockTicketsCount,
  updateChildrenOrder, cloneTemplate, addChild, getTemplate, lockSession, setSessionInitialStatus,
  updateSessionStatus, saveBlockStatus, setScormData, getBlockNote, setBlockNote, getBlockScormData,getFinishedChildrenCount,
  getBlockNoteStr, computeBlockStatus, isFinished, getSessionProof, ensureValidProgramProduction,
  getFilteredTrainee, getTopParent,
}
