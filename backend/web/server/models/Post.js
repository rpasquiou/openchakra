const mongoose = require('mongoose')
const {getDataModel} = require('../../config/config')

let PostSchema=null

try {
  PostSchema=require(`../plugins/${getDataModel()}/schemas/PostSchema`)
  customizeSchema(PostSchema)
}
catch(err) {
  if (err.code !== 'MODULE_NOT_FOUND') {
    throw err
  }
}

module.exports = PostSchema ? mongoose.model('post', PostSchema) : null
