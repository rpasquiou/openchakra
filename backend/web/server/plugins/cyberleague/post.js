const { idEqual } = require("../../utils/database")

const getLiked = async (userId, params, data) => {
  return data._likes.some(like=> idEqual (like._id, userId))
}

module.exports= {
  getLiked
}