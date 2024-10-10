const mongoose = require('mongoose')
const {schemaOptions} = require('../../../utils/schemas')
const { OFFER_VISIBILITY, OFFER_VISIBILITY_PUBLIC, ESTIMATED_DURATION_UNITS } = require('../consts')

const Schema = mongoose.Schema

const OfferSchema = new Schema({
  company: {
    type: Schema.Types.ObjectId,
    ref: 'company',
    required: [true,`L'entreprise proposant l'offre est obligatoire`]
  },
  title: {
    type: String,
    required: [true, `Le titre de l'offre est obligatoire`]
  },
  main_expertise: {
    type: Schema.Types.ObjectId,
    ref: 'expertiseCategory',
    required: [true,`L'expertise principale de l'offre est obligatoire`]
  },
  description: {
    type: String,
    validate: [value => value.length > 14, `La description de l'offre doit avoir plus de trois caractères`],
    required: true
  },
  url: {
    type: String,
    required: [true, `Le lien de l'offre est obligatoire`]
  },
  price: {
    type: String,
    required: [true, `Le prix de l'offre est obligatoire`]
  },
  price_member: {
    type: String,
    required: false
  },
  price_duration: {
    type: String,
    required: false
  },
  price_member_duration_unit: {
    type: String,
    enum: Object.keys(ESTIMATED_DURATION_UNITS),
    required: false
  },
  visibility: {
    type: String,
    enum: Object.keys(OFFER_VISIBILITY),
    default: OFFER_VISIBILITY_PUBLIC
  },
}, {...schemaOptions})

/* eslint-disable prefer-arrow-callback */
/* eslint-enable prefer-arrow-callback */

module.exports = OfferSchema