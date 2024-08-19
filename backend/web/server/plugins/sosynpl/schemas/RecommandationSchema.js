const mongoose = require('mongoose')
const {schemaOptions} = require('../../../utils/schemas')
const {DISC_CUSTOMER_FREELANCE } = require('../consts')
const { isEmailOk } = require('../../../../utils/sms')

const Schema = mongoose.Schema

const RecommandationSchema = new Schema({
  message: {
    type: String,
    required: [true, `Le message est obligatoire`],
  },
  comment: {
    type: String,
    required: [true, `Le commentaire est obligatoire`],
  },
  freelance: {
    type: Schema.Types.ObjectId,
    ref: DISC_CUSTOMER_FREELANCE,
    required: [true, `Le freelance est obligatoire`],
  },
  creator_firstname: {
    type: String,
    required: [true, `Le prénom est obligatoire`],
  },
  creator_lastname: {
    type: String,
    required: [true, `Le nom de famille est obligatoire`],
  },
  creator_company: {
    type: String,
    required: [true, `La compagnie est obligatoire`],
  },
  creator_position: {
    type: String,
    required: [true, `La fonction est obligatoire`],
  },
  creator_email: {
    type: String,
    required: [true, `L'email est obligatoire`],
    set: v => v ? v.toLowerCase().trim() : v,
    index: true,
    validate: [isEmailOk, v => `L'email '${v.value}' est invalide`],
  },
}, {...schemaOptions})

/* eslint-disable prefer-arrow-callback */
/* eslint-enable prefer-arrow-callback */

module.exports = RecommandationSchema