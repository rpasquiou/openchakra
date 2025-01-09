const mongoose = require('mongoose')
const {schemaOptions} = require('../../../utils/schemas')
const Schema = mongoose.Schema

const ProductCodeSchema = new Schema({
  code: {
    type: String,
    set : v => v ? v.toUpperCase() : v,
    required: [true, `Le code est obligatoire`],
    index: true,
  }
}, {...schemaOptions})

// Access to unique program if any using this product code
ProductCodeSchema.virtual('program', {
  ref: 'program',
  localField: '_id',
  foreignField: 'codes',
  options: {
    match: {
      origin: null, parent: null, _locked: false
    }
  },
})

module.exports = ProductCodeSchema
