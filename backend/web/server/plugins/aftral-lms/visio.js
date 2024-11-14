const mongoose=require('mongoose')

const getVisiosDays = async () => {
  return mongoose.models.visio.find()
}

module.exports={
  getVisiosDays
}