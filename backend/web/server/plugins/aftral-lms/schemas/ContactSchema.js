const { schemaOptions } = require('../../../utils/schemas');
const mongoose = require('mongoose')

const Schema = mongoose.Schema

const ContactSchema = new Schema({
  name: {
    type: String,
    required: [true, `Le nom du contact est obligatoire`],
  }
}, schemaOptions)


module.exports = ContactSchema