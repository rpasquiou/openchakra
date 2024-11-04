const mongoose = require('mongoose')
const {schemaOptions} = require('../../../utils/schemas')


const Schema = mongoose.Schema

const TripleSchema = new Schema({
  name: {
    type: String,
    required: [true, 'Le nom est obligatoire'],
  },
  value: {
    type: Number,
    required: [true, 'La valeur est obligatoire'],
  },
  market_value: {
    type: Number,
    required: [true, 'La valeur du marché est obligatoire'],
  }
}, schemaOptions  )

module.exports = TripleSchema