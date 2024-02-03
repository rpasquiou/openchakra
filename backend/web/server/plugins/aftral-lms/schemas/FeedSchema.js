const mongoose = require('mongoose')
const {schemaOptions} = require('../../../utils/schemas')
const { FEED_TYPE } = require('../consts')
const Schema = mongoose.Schema

const FeedSchema = new Schema({
  name: {
    type: String,
    required: [true, `Le nom est obligatoire`],
  },
  type: {
    type: String,
    enum: Object.keys(FEED_TYPE),
    required: [true, `Le type de forum est obligatoire`],
  },
  posts:  [{
    type: Schema.Types.ObjectId,
    required: true,
    ref: 'post'
  }],
}, schemaOptions)

module.exports = FeedSchema
