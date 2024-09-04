const mongoose = require("mongoose")
const bcrypt = require('bcryptjs')
const { isEmailOk } = require("../../../../utils/sms")
const { ROLES } = require("../consts")
const { schemaOptions } = require("../../../utils/schemas")

const Schema = mongoose.Schema

const SearchSchema = new Schema({
  pattern: {
    type: String,
    set: v => v?.trim(),
    required: [true, `Le texte de recherche est obligatoire`],
  },
  blocks: [{
    type: Schema.Types.ObjectId,
    ref: 'block',
  }],
  users: [{
    type: Schema.Types.ObjectId,
    ref: 'user',
  }],
  creator: {
    type: Schema.Types.ObjectId,
    ref: `user`
  }
}, schemaOptions)

/* eslint-disable prefer-arrow-callback */

/* eslint-enable prefer-arrow-callback */

module.exports = SearchSchema
