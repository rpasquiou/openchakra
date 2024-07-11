const { idEqual } = require("../../utils/database")

const isMine = async (userId, params, data)  => {
  return idEqual(userId, data.sender)
}

module.exports={
  isMine
}