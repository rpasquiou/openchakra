const mongoose = require('mongoose')
const { MongoMemoryServer } = require('mongodb-memory-server')
const { MONGOOSE_OPTIONS } = require('../../server/utils/database')

let mongoServer

module.exports.connectToDatabase = async () => {
  mongoServer = await MongoMemoryServer.create()
  const uri = mongoServer.getUri()

  await mongoose.connect(uri, MONGOOSE_OPTIONS)
}

module.exports.disconnectFromDatabase = async () => {
  await mongoose.connection.dropDatabase()
  await mongoose.connection.close()
  await mongoServer.stop()
}
