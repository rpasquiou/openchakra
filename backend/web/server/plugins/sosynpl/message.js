const { idEqual } = require("../../utils/database")

const isMine = (user, sender) => {
  return idEqual(user, sender)
}

exports.isMine = isMine