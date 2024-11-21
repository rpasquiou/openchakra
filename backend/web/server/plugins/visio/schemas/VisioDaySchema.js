const moment=require('moment')
const mongoose=require('mongoose')
const {schemaOptions} = require('../../../utils/schemas')
const { DUMMY_REF } = require('../../../utils/database')
const { VISIO_STATUS_UNDEFINED, VISIO_STATUS_TO_COME, VISIO_STATUS_FINISHED, VISIO_STATUS_CURRENT } = require('../consts')

const Schema = mongoose.Schema

const VisioDaySchema = new Schema({
  day: {
    type: Date,
    required: [true, `Le jour est obligatoire`]
  },
  all_finished: {
    type: Boolean,
    required: [true, `Tous terminés ne peut être nul`],
  },
  visios: [{
    type: Schema.Types.ObjectId,
    ref: 'visio',
  }],
}, schemaOptions)

/* eslint-disable prefer-arrow-callback */

/* eslint-enable prefer-arrow-callback */

module.exports = VisioDaySchema