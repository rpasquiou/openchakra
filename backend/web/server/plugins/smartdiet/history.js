const { CREATED_AT_ATTRIBUTE } = require("../../../utils/consts")
const History = require("../../models/History")

const historicize = async ({source, modelName, attribute, value}) => {
  value=JSON.stringify(value)
  const latest=await History.findOne({source, attribute}).sort({[CREATED_AT_ATTRIBUTE]: -1 })
  if (latest?.value!=value) {
    return History.create({source, docModel: modelName, attribute, value})
  } 
}

module.exports={
  historicize,
}