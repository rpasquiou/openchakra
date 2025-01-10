const AdminDashboard = require('../../models/AdminDashboard')
const AdminDashboard = require('../../models/Note')
const { LIVEFEED_MAX_LENGTH } = require('./consts')

const addToLivefeed = async (params) => {
  const adminDashboard = await AdminDashboard.findOne({})
  const newNote = await Note.create(params)
  const updatedLivefeed = [newNote._id, ...adminDashboard.livefeed].slice(0,LIVEFEED_MAX_LENGTH)
  return AdminDashboard.findOneAndUpdate({}, {livefeed: updatedLivefeed})
}

module.exports = {
  addToLivefeed,
}