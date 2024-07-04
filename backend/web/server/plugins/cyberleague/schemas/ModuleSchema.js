const mongoose = require('mongoose')
const {schemaOptions} = require('../../../utils/schemas')

const Schema = mongoose.Schema

const ModuleSchema = new Schema({
  ressources: [{
    type: Schema.Types.ObjectID,
    ref: 'ressource',
    required: true,
  }],
  name: {
    type: String,
    required: [true, `Le nom est obligatoire`]
  },
  trophy: {
    type: Schema.Types.ObjectId,
    ref: 'trophy',
    required: false,
  },
  coin: {
    type: Number,
    required: false,
  }
}, schemaOptions)

module.exports = ModuleSchema
