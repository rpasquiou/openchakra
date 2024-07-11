const mongoose = require('mongoose')

const setterPinnedFn = async (model) => {
  return async ({ id, attribute, value, user }) => {
    const upd=!!value ? { $addToSet: { pinned_by: user._id }} : { $pullAll: { pinned_by: [user._id] }}
    return mongoose.models[model].findByIdAndUpdate(id, upd)
  }
}

const getterPinnedFn = async (model) => {
  return async (userId, params, data) => {
    const pinned = data?.pinned_by?.some(l => idEqual(l._id, userId))
    return pinned
  }
}

module.exports={
  getterPinnedFn, setterPinnedFn
}