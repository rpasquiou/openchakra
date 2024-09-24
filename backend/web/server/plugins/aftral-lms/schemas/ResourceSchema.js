const mongoose = require('mongoose')
const {schemaOptions} = require('../../../utils/schemas')
const Schema = mongoose.Schema
const {BLOCK_DISCRIMINATOR}=require('../consts')
const { BadRequestError } = require('../../../utils/errors')

const ResourceSchema = new Schema({
  shortName: {
    type: String,
    required: false,
  },
  creator: {
    type: Schema.Types.ObjectId,
    ref: 'user',
    required: [true, 'Le créateur est obligatoire'],
  },
  optional: {
    type: Boolean,
    default: null,
    required: false,
  },
  mine: {
    type: Boolean,
  },
}, {...schemaOptions, ...BLOCK_DISCRIMINATOR})

ResourceSchema.pre('validate', async function(next) {
  if (!!this?.origin) {
    return next()
  }
  return mongoose.models.resource.exists({_id: {$ne: this._id}, code: this.code, origin: null})
    .then(exists => {
      if (exists) {
        return next(new BadRequestError(`Une resource de code ${this.code} existe déjà`))
      }
      return next()
    })
})

module.exports = ResourceSchema
