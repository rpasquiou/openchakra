const mongoose = require('mongoose')
const { schemaOptions } = require('../../../utils/schemas')
const Schema = mongoose.Schema

const QuestionSchema = new Schema({
  title: {
    type: String,
    required: [true, `Le titre est obligatoire`],
  },
  answer: {
    type: String,
    required: false,
  },
  tag: {
    type: String,
    required: false,
  },
  announce: {
    type: Schema.Types.ObjectId,
    ref: 'announce',
    required: false,
  }
}, { ...schemaOptions })

module.exports = QuestionSchema