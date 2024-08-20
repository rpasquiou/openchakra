const { idEqual } = require("../../utils/database")

const getPinned = async (userId, params, data) => {
  return data.pinned_by.some(user=> idEqual (user._id, userId))
}

module.exports= {
  getPinned
}