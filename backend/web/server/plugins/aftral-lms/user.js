const Session = require('../../models/Session')
const { getSessionBlocks } = require('./block')
const { loadFromDb } = require('../../utils/database')

const getTraineeResources = async (userId, params, data) => {
  const sessions = await Session.find({ trainees: data._id }).populate('children')
  const blocks = await Promise.all(
    sessions.map(s =>   getSessionBlocks(s))
  )
  const resources = blocks.flat().filter(b => b.type == 'resource')
  const res = await Promise.all(resources.map(b => loadFromDb({id:b._id, fields:['spent_time_str','name','resource_type','achievement_rule'], model:'resource',  user:data})))
  return res
}


module.exports = {
  getTraineeResources
}