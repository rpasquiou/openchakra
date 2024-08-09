const mongoose = require('mongoose')
const Session = require('../../models/Session')
const { getBlockResources } = require('./resources')
const Block = require('../../models/Block')
const Resource = require('../../models/Resource')
const Program = require('../../models/Program')
const Chapter = require('../../models/Chapter')
const Module = require('../../models/Module')
const Sequence = require('../../models/Sequence')
const { BLOCK_STATUS_CURRENT } = require('./consts')

const getRelatedDocuments = async (Model, ids) => {
  return await Model.find({ _id: { $in: ids } }).populate('children')
}

const getIdsFromChildren = (documents) => {
  return documents.flatMap(doc => doc.children.map(child => child._id))
}

const getTraineeResources = async (userId, params, data) => {
  const sessions = await Session.find({ trainees: data._id }).populate('children')
  
  const programIds = getIdsFromChildren(sessions)
  const programs = await getRelatedDocuments(Program, programIds)
  
  let modules
  
  if (programs[0]?.children[0]?.type === 'chapter') {
    const chapterIds = getIdsFromChildren(programs)
    const chapters = await getRelatedDocuments(Chapter, chapterIds)
    
    const moduleIds = getIdsFromChildren(chapters)
    modules = await getRelatedDocuments(Module, moduleIds)
  } else {
    const moduleIds = getIdsFromChildren(programs)
    modules = await getRelatedDocuments(Module, moduleIds)
  }
  
  const sequenceIds = getIdsFromChildren(modules)
  const sequences = await getRelatedDocuments(Sequence, sequenceIds)
  
  const resourceIds = getIdsFromChildren(sequences)
  const resources = await Resource.find({ _id: { $in: resourceIds }, achievement_status: BLOCK_STATUS_CURRENT })
  return resources
}


module.exports = {
  getTraineeResources
}