const mongoose = require('mongoose')
const { schemaOptions } = require('../../../utils/schemas')


const Schema = mongoose.Schema

const CoachingStatSchema = new Schema({
  name: {
    type: String,
    required: [true, 'Le nom est otbligatoire'],
  },
  total : {
    type: Number,
    required: [true, 'Le total est obligatoire'],
  },
  ranges: {
    type: Schema.Types.ObjectId,
    ref: 'pair',
    required: [true, 'Les classes d age sont obligatoires'],
  }, 
  appointments: {
    type: Schema.Types.ObjectId,
    ref: 'appointmentStat',
    required: [true, 'Les appointments sont obligatoires'],
  }, 
},{...schemaOptions})
module.exports = CoachingStatSchema
