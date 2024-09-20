const mongoose = require('mongoose')
const lodash = require('lodash')
const {schemaOptions} = require('../../../utils/schemas')
const Schema = mongoose.Schema
const {BLOCK_DISCRIMINATOR, PROGRAM_STATUS, PROGRAM_STATUS_DRAFT, DURATION_UNIT}=require('../consts')

const ProgramSchema = new Schema({
  status: {
    type: String,
    enum: Object.keys(PROGRAM_STATUS),
    default: PROGRAM_STATUS_DRAFT,
    required: [true, `Le status est obligatoire`],
  },
  duration: {
    type: Number,
    required: false,
  },
  duration_unit: {
    type: String,
    enum: Object.keys(DURATION_UNIT),
    required: function() {return this.duration!=null ? [true, `L'unité de temps est obligatoire`] : false}
  },
  template: {
    type: Schema.Types.ObjectId,
    ref: 'certification',
    required: false,
  },
  certificate: {
    type: String,
    required: false,
  },
  _certificate: {
    type: String,
    required: false,
  },
}, {...schemaOptions, ...BLOCK_DISCRIMINATOR})

/* eslint-disable prefer-arrow-callback */
/* eslint-enable prefer-arrow-callback */


ProgramSchema.pre('validate', function(next) {
  // For non-template: exit
  if (!!this.origin) {
    return next()
  }
  //#155 If the program has code(s), check it's not already used
  if (!this._locked && !this.origin && !lodash.isEmpty(this.codes)) {
    return mongoose.models['program'].findOne(
      {_id: {$ne : this._id}, codes: {$in : this.codes}, origin: null}
    ).populate('codes')
    .then(program => {
      if (program) { 
        const usedCodes=lodash(program.codes).intersectionBy(this.codes, v => v._id.toString()).map('code')
        return next(new Error(`Le programme ${program.name} utilise déjà le(s) code(s) ${usedCodes}`))
      }
      return next()
    })
  }
  return next()
})

module.exports = ProgramSchema
