const mongoose = require('mongoose')

const getterCountFn = (model, filter = {}) => {
  return async function () {
    const count = await mongoose.model(model).countDocuments(filter)
    return count
  }
}

module.exports = { getterCountFn }