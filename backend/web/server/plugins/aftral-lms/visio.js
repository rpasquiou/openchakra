const mongoose=require('mongoose')

const getVisios = async () => {
  return mongoose.models.visio.find()
}

module.exports={
  getVisios
}