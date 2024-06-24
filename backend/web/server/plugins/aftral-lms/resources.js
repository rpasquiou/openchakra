const Homework = require("../../models/Homework")

const getUserHomeworks = async (userId, params, data) => {
  return Homework.find({user: userId, resource: data._id})
}

module.exports={
  getUserHomeworks,
}