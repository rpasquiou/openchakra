const mongoose = require('mongoose')

const getterCountFn = (model) => {
  return async () => {
    count = await mongoose.models[model].countDocuments()
    return count
  }
}

module.exports={
  getterCountFn
}