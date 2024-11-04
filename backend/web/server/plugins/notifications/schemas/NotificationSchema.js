const mongoose = require('mongoose')
const {schemaOptions} = require('../../../utils/schemas')

const Schema = mongoose.Schema

const NotificationSchema = new Schema({
  _text: {
    type: String,
    required: [true, `Un texte est obligatoire pour une notification`]
  },
  recipients: {
    type: [{
      type: Schema.Types.ObjectId,
      ref: 'user',
      required: true
    }]
  },
  seen_by_recipients: {
    type: [{
      type: Schema.Types.ObjectId,
      ref: 'user',
      required: true
    }]
  },
}, schemaOptions)

/* eslint-disable prefer-arrow-callback */
/* eslint-enable prefer-arrow-callback */

module.exports = NotificationSchema
