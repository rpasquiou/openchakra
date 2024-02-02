const mongoose = require('mongoose')
const {schemaOptions} = require('../../../utils/schemas')
const Schema = mongoose.Schema

const FeedSchema = new Schema({
  name: {
    type: String,
    required: [true, `Le nom est obligatoire`],
  },
  posts:  [{
    type: Schema.Types.ObjectId,
    required: true,
    ref: 'post'
  }],
}, schemaOptions)

module.exports = FeedSchema
