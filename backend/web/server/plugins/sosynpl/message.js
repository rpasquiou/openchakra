const { idEqual } = require("../../utils/database")

const isMine = async (userId, params, data, fields)  => {
  const equal=idEqual(userId, data.sender?._id)
  return equal
}

module.exports={
  isMine
}