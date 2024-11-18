const lodash=require('lodash')

// TODO Return loaded trainees with proper requried fields
const getGroupTrainees = async (userId, params, data, fields, actualLogged) => {
  console.log('getting group trainees', userId, params, fields, actualLogged)
  console.log(lodash(data.sessions).map(s => s.trainees).flatten().value())
  return lodash(data.sessions).map(s => s.trainees).flatten().uniqBy(trainee => trainee._id).value()
}

module.exports={
  getGroupTrainees,
}
