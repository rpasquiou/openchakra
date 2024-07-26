const mongoose = require("mongoose")
const { CREATED_AT_ATTRIBUTE } = require("../../../utils/consts")

const historicize = async ({source, modelName, attribute, value}) => {
  value=JSON.stringify(value)
  const latest=await mongoose.models.history.findOne({source, attribute}).sort({[CREATED_AT_ATTRIBUTE]: -1 })
  if (latest.value!=value) {
    mongoose.models('history').create({source, docModel: modelName, attribute, value})
  } 
}


module.exports={
  historicize,
}