const lodash=require('lodash')
const Group = require('../../models/Group')

// TODO Return loaded trainees with proper requried fields
const getGroupTrainees = async (userId, params, data, fields, actualLogged) => {
  return lodash(data.sessions).map(s => s.trainees).flatten().uniqBy(trainee => trainee._id).value()
}

const getGroupTraineesCount = async (userId, params, data, fields, actualLogged) => {
  const gr=await Group.findById(data._id).populate('sessions')
  return lodash(gr.sessions).map(s => s.trainees?.length || 0).sum()
}

module.exports={
  getGroupTrainees, getGroupTraineesCount,
}
