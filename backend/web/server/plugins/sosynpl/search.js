const CustomerFreelance = require("../../models/CustomerFreelance")

const computeSuggestedFreelances = async (userId, params, data)  => {
  return CustomerFreelance.find()
}

module.exports={
  computeSuggestedFreelances,
}