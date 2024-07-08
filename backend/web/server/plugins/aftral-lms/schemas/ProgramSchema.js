const mongoose = require('mongoose')
const lodash = require('lodash')
const {schemaOptions} = require('../../../utils/schemas')
const Schema = mongoose.Schema
const {BLOCK_DISCRIMINATOR, PROGRAM_STATUS, PROGRAM_STATUS_DRAFT}=require('../consts')

const ProgramSchema = new Schema({
  status: {
    type: String,
    enum: Object.keys(PROGRAM_STATUS),
    default: PROGRAM_STATUS_DRAFT,
    required: [true, `Le status est obligatoire`],
  },
  codes: [{
    type: Schema.Types.ObjectId,
    ref: 'productCode',
  }],
  available_codes: [{
    type: Schema.Types.ObjectId,
    ref: 'productCode'
  }],
}, {...schemaOptions, ...BLOCK_DISCRIMINATOR})

/* eslint-disable prefer-arrow-callback */
/* eslint-enable prefer-arrow-callback */


ProgramSchema.pre('validate', function(next) {
  return mongoose.models['program'].findOne(
    {_id: {$ne : this._id}, codes: {$in : this.codes}}
  ).populate('codes')
  .then(program => {
    if (program) { 
      const usedCodes=lodash(program.codes).intersectionBy(this.codes, v => v._id.toString()).map('code')
      return next(new Error(`Le programme ${program.name} utilise déjà le(s) code(s) ${usedCodes}`))
    }
    return next()
  })
})

module.exports = ProgramSchema
