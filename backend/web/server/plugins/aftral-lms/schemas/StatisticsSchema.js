const mongoose = require('mongoose')
const {schemaOptions} = require('../../../utils/schemas')
const Schema = mongoose.Schema
const {BLOCK_DISCRIMINATOR, RESOURCE_TYPE, BLOCK_STATUS}=require('../consts')

const StatisticsShema = new Schema({
  sessions: [{
    type: Schema.Types.ObjectId,
    ref: 'session',
    required: true,
  }],
}, {...schemaOptions})

module.exports = StatisticsShema
