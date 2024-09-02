const { idEqual } = require('../../utils/database.js')

const getConversationPartner = async (userId, params, data, fields) => {
  const partner = idEqual(data.users[0]._id, userId)
    ? data.users[1]
    : data.users[0]

  return partner
}

module.exports = { getConversationPartner }
