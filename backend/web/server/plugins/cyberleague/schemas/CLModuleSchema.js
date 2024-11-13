const mongoose = require('mongoose')
const {schemaOptions} = require('../../../utils/schemas')

const Schema = mongoose.Schema

const CLModuleSchema = new Schema({
  resources: {
    type: [{
      type: Schema.Types.ObjectID,
      ref: 'resource',
      required: true,
    }],
    default: []
  },
  name: {
    type: String,
    required: [true, `Le nom du module est obligatoire`]
  },
  trophy: {
    type: Schema.Types.ObjectId,
    ref: 'gift',
    required: false,
  },
}, schemaOptions)

/* eslint-disable prefer-arrow-callback */
/* eslint-enable prefer-arrow-callback */

module.exports = CLModuleSchema