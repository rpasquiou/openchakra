const mongoose = require('mongoose')
const {schemaOptions} = require('../../../utils/schemas')

const Schema = mongoose.Schema

const CertificationSchema = new Schema({
  title: {
    type: String,
    required: [true, `Le titre est obligatoire`],
  },
  picture: {
    type: String,
    required: [true, `Le logo est obligatoire`],
  },
}, {...schemaOptions})

/* eslint-disable prefer-arrow-callback */
/* eslint-enable prefer-arrow-callback */

module.exports = CertificationSchema