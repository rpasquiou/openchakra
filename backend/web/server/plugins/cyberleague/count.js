const mongoose = require('mongoose')

const getterCountFn = (model, filterFiled, filterValue) => {
  return async function () {
    let query = {}
    if (filterFiled && filterValue) {
      query[filterFiled] = filterValue
    }
    const count = await mongoose.model(model).countDocuments(query)
    return count
  }
}

module.exports = { getterCountFn }