const { idEqual } = require('../../utils/database')

const isMineForPost = async (userId, params, data, fields)  => {
  const equal=idEqual(userId, data.creator?._id)
  return equal
}

module.exports={
  isMineForPost
}