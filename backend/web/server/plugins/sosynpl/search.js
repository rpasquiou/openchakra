const Freelance = require("../../models/Freelance")

const computeSuggestedFreelances = async (userId, params, data)  => {
  return Freelance.find()
}

module.exports={
  computeSuggestedFreelances,
}