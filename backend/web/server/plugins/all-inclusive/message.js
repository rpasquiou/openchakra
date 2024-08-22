const { idEqual } = require("../../utils/database")

const isMine = async (userId, params, data) => {
  return idEqual(data.sender._id, userId)
}

module.exports= {
  isMine
}