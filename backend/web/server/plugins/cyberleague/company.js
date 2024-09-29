const Content = require('../../models/Content')

const getContents = async (userId, params, data) => {
  const contents = await Content.find({creator: data.users})
  return contents
}

module.exports = { getContents }