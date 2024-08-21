const { idEqual } = require("../../utils/database")

const isLiked = async(userId, params, data) => {
  return data._liked_by.some(like=> idEqual(l._id,userId))
}

module.exports={
  isLiked
}