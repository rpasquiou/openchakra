const mongoose=require('mongoose')
const { displayTree } = require("../../server/plugins/aftral-lms/utils")
const { MONGOOSE_OPTIONS } = require('../../server/utils/database')

const rootId=process.argv[2]

if (!rootId) {
  console.error('expected rootId parameter')
}

const display = async() => {
  await mongoose.connect(`mongodb://localhost/aftral-lms`, MONGOOSE_OPTIONS)
  console.log('connected')
  await displayTree(rootId)
}

display()

