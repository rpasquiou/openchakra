const mongoose = require('mongoose')
const {schemaOptions} = require('../../../utils/schemas')

const Schema = mongoose.Schema

const CLModuleSchema = new Schema({
  resources: [{
    type: Schema.Types.ObjectID,
    ref: 'resource',
    required: true,
  }],
  name: {
    type: String,
    required: [true, `Le nom est obligatoire`]
  },
  trophy: {
    type: Schema.Types.ObjectId,
    ref: 'gift',
    required: false,
  },
  coin: {
    type: Number,
    required: false,
  }
}, schemaOptions)

module.exports = CLModuleSchema
