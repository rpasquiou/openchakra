const mongoose = require('mongoose')
const { idEqual } = require('./database')

/*
Setter and Getter for pinned items by a user, the parameter attribute is here if the attribute is not named "pinned_by" (for example : liked_by)
TODO : review all project to be able to get rid of the default value of the param attribute
*/

const setterPinnedFn = (model, attribute = `pinned_by`) => {
  return async ({ id, att, value, user }) => {
    const upd=!!value ? { $addToSet: { [attribute]: user._id }} : { $pullAll: { [attribute]: [user._id] }}
    return mongoose.models[model].findByIdAndUpdate(id, upd)
  }
}

const getterPinnedFn = (model, attribute = `pinned_by`) => {
  return async (userId, params, data) => {
    const pinned = data?.[attribute]?.some(l => idEqual(l._id, userId))
    return pinned
  }
}

module.exports={
  getterPinnedFn, setterPinnedFn
}