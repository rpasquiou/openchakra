const mongoose = require('mongoose')
const { schemaOptions } = require('../../../utils/schemas')


const Schema = mongoose.Schema

const AppointmentStatSchema = new Schema({
  order: {
    type: Number,
    required: [true, 'L ordre est obligatoire'],
  },
  total: {
    type: Number,
    required: [true, 'Le total est obligatoire'],
  },
  ranges: {
    type: Schema.Types.ObjectId,
    ref: 'pair',
    required: [true, 'Les statistiques par tranche d age sont obligatoires'],
  }
}, {...schemaOptions})

module.exports = AppointmentStatSchema
