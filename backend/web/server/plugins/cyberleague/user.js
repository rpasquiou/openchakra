const User = require('../../models/User')
const mongoose = require('mongoose')
const { loadFromDb } = require('../../utils/database')

const getLooking = async function () {
  const looking = await loadFromDb({model: 'user', fields: ['looking_for_opportunities']})//mongoose.model(model).find()
  console.log("looking", looking)
 
  
  // const ids = looking.map((u) => u._id)
  // console.log(ids);
  
  return looking//ids
}

module.exports = { getLooking }