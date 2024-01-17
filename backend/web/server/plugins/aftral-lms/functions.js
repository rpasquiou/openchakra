const Block = require('../../models/Block')
const lodash=require('lodash')
const { runPromisesWithDelay } = require('../../utils/concurrency')
const {
  declareVirtualField, setPreCreateData, setPreprocessGet, setMaxPopulateDepth, setFilterDataUser, declareComputedField, declareEnumField, idEqual,
} = require('../../utils/database')
const { RESOURCE_TYPE, PROGRAM_STATUS, ROLES, MAX_POPULATE_DEPTH, BLOCK_STATUS, ROLE_CONCEPTEUR, ROLE_FORMATEUR } = require('./consts')
const cron=require('node-cron')
const Duration = require('../../models/Duration')
const { formatDuration } = require('../../../utils/text')
const mongoose = require('mongoose')
const Resource = require('../../models/Resource')

const getAncestors = async id => {
  const parents=await Block.find({$or: [{actual_children: id}, {origin: id}]}, {_id:1})
  const parentsAncestors=await Promise.all(parents.map(p => getAncestors(p._id)))
  return lodash.flattenDeep([id, parentsAncestors])
}

const cloneStrructure = program_id => {
  return Block.find()
}

const count_resources = (userId, params, data) => {
  return Block.findById(data._id)
    .then(block => {
      if (block.type=='resource') {
        return 1
      }
      const children=[block.origin, ...block.actual_children].filter(v => !!v).map(v => v._id)
      return Promise.all(children.map(c => count_resources(userId, params, {_id: c})))
        .then(res => lodash.sum(res))
    })
}

const count_finished_resources = (userId, params, data) => {
  return Block.findById(data._id)
  .then(block => {
    if (block.type=='resource') {
      return Duration.findOne({block: data._id, user: userId})
        .then(duration => duration?.finished ? 1 : 0)
    }
    const children=[block.origin, ...block.actual_children].filter(v => !!v)
    return Promise.all(children.map(c => count_finished_resources(userId, params, {_id: c})))
      .then(res => lodash.sum(res))
  })
}

const compute_resources_progress = (userId, params, data) => {
  return Promise.all([count_finished_resources(userId, params, data), count_resources(userId, params, data)])
  .then(([progress, total]) => {
    return progress/total
  })
}

setMaxPopulateDepth(MAX_POPULATE_DEPTH)

const MODELS=['block', 'program', 'module', 'sequence', 'resource', 'session']

MODELS.forEach(model => {
  declareVirtualField({model, field: 'name', instance: 'Number', requires: 'origin.name'})
  declareVirtualField({model, field: 'url', instance: 'Number', requires: 'origin.url'})
  declareVirtualField({model, field: 'duration', instance: 'Number', requires: 'origin.duration'})
  declareVirtualField({model, field: 'order', instance: 'Number'})
  declareVirtualField({model, field: 'duration_str', instance: 'String', requires: 'duration,origin.duration'})
  declareVirtualField({model, field: 'children_count', instance: 'Number', requires: 'children,actual_children,origin.children,origin.actual_children'})
  declareVirtualField({model, field: 'resource_type', instance: 'String', enumValues: RESOURCE_TYPE, requires: 'origin.resource_type'})
  declareVirtualField({model, field: 'evaluation', instance: 'Boolean'})
  declareVirtualField({model, field: 'children', instance: 'Array', requires: 'actual_children,origin.children,origin.actual_children,actual_children.origin',
    multiple: true,
    caster: {
      instance: 'ObjectID',
      options: {ref: 'block'}},
  })
  declareVirtualField({model, field: 'actual_children', instance: 'Array',
    multiple: true,
    caster: {
      instance: 'ObjectID',
      options: {ref: 'block'}},
  })
  declareVirtualField({model, field: 'origin', instance: 'Block', requires: 'origin.actual_children,origin.children',
    multiple: false,
    caster: {
      instance: 'ObjectID',
      options: {ref: 'block'}},
  })
  declareVirtualField({model, field: 'spent_time', instance: 'Number'})
  declareComputedField(model, 'spent_time', (userId, params, data) => {
    return Duration.findOne({user: userId, block: data._id}, {duration:1})
      .then(result => result?.duration || 0)
  })
  declareVirtualField({model, field: 'spent_time_str', instance: 'Number'})
  declareComputedField(model, 'spent_time_str', (userId, params, data) => {
    return Duration.findOne({user: userId, block: data._id}, {duration:1})
      .then(result => formatDuration(result?.duration || 0))
  })
  declareEnumField({model, field: 'achievement_status', enumValues: BLOCK_STATUS})
  declareVirtualField({model, field: 'resources_count', instance: 'Number'})
  declareComputedField(model, 'resources_count', count_resources)
  declareVirtualField({model, field: 'finished_resources_count', instance: 'Number'})
  declareComputedField(model, 'finished_resources_count', count_finished_resources)
  declareVirtualField({model, field: 'search_text', instance: 'String', requires:'name,code'})
  declareComputedField(model, 'resources_progress', compute_resources_progress)
  declareVirtualField({model, field: 'resources_progress', instance: 'Number', requires:'resources_count,finished_resources_count'})
})

declareVirtualField({model:'program', field: 'status', instance: 'String', enumValues: PROGRAM_STATUS})

const USER_MODELS=['user', 'loggedUser']
USER_MODELS.forEach(model => {
  declareVirtualField({model, field: 'role', instance: 'String', enumValues: ROLES})
})

const preCreate = ({model, params, user}) => {
  if (['resource'].includes(model)) {
    params.creator=params?.creator || user
  }
  return Promise.resolve({model, params})
}

setPreCreateData(preCreate)


const preprocessGet = ({model, fields, id, user, params}) => {
  if (model=='loggedUser') {
    model='user'
    id = user?._id || 'INVALIDID'
  }
  // Add resource.creator.role to filter after
  if (model=='resource') {
    fields=[...fields, 'creator.role']
  }

  return Promise.resolve({model, fields, id})
}

setPreprocessGet(preprocessGet)

const updateDuration = async block => {
  if (block.type=='resource' && block.isTemplate()) {
    return block.duration
  }
  let total=0
  const all=[block.origin, ...block.actual_children].filter(v => !lodash.isNil(v))
  let children=await Promise.all(all.map(child => Block.findById(child).populate(['actual_children', 'children', 'origin'])))
  for (const child of children) {
    total += await updateDuration(child)
  }
  block.duration=total
  await block.save()
  return total
}

const updateAllDurations = async () => {
  const blocks= await Block.find().populate(['actual_children', 'origin'])
  for(const block of blocks) {
    await updateDuration(block)
  }
}

const filterDataUser = ({model, data, id, user}) => {
  if (MODELS.includes(model) && !id) {
    data=data.filter(d => !d.origin)
    // Filter my sessions
    if (model=='session') {
      data=data.filter(d => [...d.trainers, ...d.trainees].some(v => idEqual(v._id || v, user._id)))
    }
    if (model=='resource') {
      const ressources_filter=user.role==ROLE_CONCEPTEUR ? r => r.creator.role==ROLE_CONCEPTEUR 
        :
        user.role==ROLE_FORMATEUR ? r => r.creator.role==ROLE_CONCEPTEUR || idEqual(r.creator._id, user._id)
        :
        () => false
      return data.filter(ressources_filter)
    }
  }
  return Promise.resolve(data)
}

setFilterDataUser(filterDataUser)

cron.schedule('*/20 * * * * *', async() => {
  const msg = 'Updating all durations'
  console.time(msg)
  return updateAllDurations()
    .finally(() => console.timeEnd(msg))
})

module.exports={
  updateDuration,
  updateAllDurations,
  getAncestors,
}