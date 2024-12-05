const mongoose = require('mongoose')
const {schemaOptions} = require('../../../utils/schemas')

const Schema = mongoose.Schema

const CustomerSuccessSchema = new Schema({
  name: {
    type: String,
    required: [true, `Le nom est obligatoire`],
  },
  logo: {
    type: String,
    required: [true, `Le logo est obligatoire`],
  },
}, {...schemaOptions})

/* eslint-disable prefer-arrow-callback */
/* eslint-enable prefer-arrow-callback */

module.exports = CustomerSuccessSchema