const ProductCode=require('../../models/ProductCode')
const Program=require('../../models/Program')
const lodash=require('lodash')

const getAvailableCodes =  async (userId, params, data) => {
  let otherPrograms=await Program.find({_id: {$ne: data._id}}).populate('codes')
  const usedCodes=lodash(otherPrograms).map(p => p.codes).flatten().map(c => c.code).value()
  let availableCodes=await ProductCode.find({code: {$nin: usedCodes}})
  return availableCodes
}

module.exports={
  getAvailableCodes,
}