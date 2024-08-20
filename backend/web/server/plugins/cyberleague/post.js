const { idEqual } = require("../../utils/database")

const getLiked = async (userId, params, data) => {
  return data._liked_by.some(like=> idEqual (like._id, userId))
}

module.exports= {
  getLiked
}