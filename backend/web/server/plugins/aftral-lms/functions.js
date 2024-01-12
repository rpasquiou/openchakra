const Block = require('../../models/Block')
const lodash=require('lodash')
const { runPromisesWithDelay } = require('../../utils/concurrency')
const {
  declareVirtualField, setPreCreateData, declareEnumField, setPreprocessGet,
} = require('../../utils/database')
const { RESOURCE_TYPE, PROGRAM_STATUS, ROLES } = require('./consts')
const cron=require('node-cron')

const MODELS=['block', 'program', 'module', 'sequence', 'resource']

MODELS.forEach(model => {
  declareVirtualField({model, field: 'duration', instance: 'Number'})
  declareVirtualField({model, field: 'order', instance: 'Number'})
  declareVirtualField({model, field: 'duration_str', instance: 'String'})
  declareVirtualField({model, field: 'children_count', instance: 'Number'})
  declareVirtualField({model, field: 'resource_type', instance: 'String', enumValues: RESOURCE_TYPE})
  declareVirtualField({model, field: 'evaluation', instance: 'Boolean'})
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
  if (block.type=='resource') {
    return block.duration
  }
  let total=0
  const blocks=await Promise.all(block.children.map(child => child.updateDuration ? child : Block.findById(child)))
  for (const block of blocks) {
    total += await updateDuration(block)
  }
  block.duration=total
  await block.save()
  return total
}

const updateAllDurations = async () => {
  const blocks= await Block.find()
  for(const block of blocks) {
    await updateDuration(block)
  }
}

cron.schedule('*/10 * * * * *', async() => {
  console.log('Updating all durations')
  updateAllDurations()
})

module.exports={
  updateDuration,
  updateAllDurations,
}