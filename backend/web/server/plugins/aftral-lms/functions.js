const Block = require('../../models/Block')
const lodash=require('lodash')
const { runPromisesWithDelay } = require('../../utils/concurrency')
const {
  declareVirtualField, setPreCreateData, declareEnumField, setPreprocessGet, setMaxPopulateDepth, setFilterDataUser,
} = require('../../utils/database')
const { RESOURCE_TYPE, PROGRAM_STATUS, ROLES, MAX_POPULATE_DEPTH } = require('./consts')
const cron=require('node-cron')


setMaxPopulateDepth(MAX_POPULATE_DEPTH)

const MODELS=['block', 'program', 'module', 'sequence', 'resource', 'session']

MODELS.forEach(model => {
  declareVirtualField({model, field: 'name', instance: 'Number', requires: 'origin.name'})
  declareVirtualField({model, field: 'duration', instance: 'Number', requires: 'origin.duration'})
  declareVirtualField({model, field: 'order', instance: 'Number'})
  declareVirtualField({model, field: 'duration_str', instance: 'String', requires: 'duration,origin.duration'})
  declareVirtualField({model, field: 'children_count', instance: 'Number', requires: 'children,actual_children,origin.children,origin.actual_children'})
  declareVirtualField({model, field: 'resource_type', instance: 'String', enumValues: RESOURCE_TYPE})
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

  return Promise.resolve({model, fields, id})
}

setPreprocessGet(preprocessGet)

const updateDuration = async block => {
  console.log(block.isTemplate(), block.name, 'duration is', block.duration)
  if (block.type=='resource') {
    console.log(block.isTemplate(), block.name, 'returns', block.duration)
    return block.duration
  }
  let total=0
  const children=await Promise.all(block.children.map(child => child.updateDuration ? child : Block.findById(child).populate(['actual_children', 'children', 'origin'])))
  for (const child of children) {
    console.log(child.isTemplate(), child.name, 'total', total)
    total += await updateDuration(child)
  }
  console.log(block.isTemplate(), block.name, block.type, 'full total is', total)
  block.duration=total
  await block.save()
  return total
}

const updateAllDurations = async () => {
  const blocks= await Block.find().populate('actual_children')
  for(const block of blocks) {
    await updateDuration(block)
  }
}

const filterDataUser = ({model, data, id, user}) => {
  if (MODELS.includes(model) && !id) {
    data=data.filter(d => !d.origin)
  }
  return Promise.resolve(data)
}

setFilterDataUser(filterDataUser)

cron.schedule('*/10 * * * * *', async() => {
  console.time('Updating all durations')
  await updateAllDurations()
  console.timeEnd('Updating all durations')
})

module.exports={
  updateDuration,
  updateAllDurations,
}