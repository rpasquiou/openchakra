const mongoose = require("mongoose")
const { schemaOptions } = require('../../../utils/schemas')
const { isEmailOk, isPhoneOk } = require('../../../../utils/sms')

const Schema = mongoose.Schema;

const CompanySchema = new Schema({
  firstname: {
    type: String,
    required: [true, 'Le prénom est obligatoire']
  },
  lastname: {
    type: String,
    required: [true, 'Le nom est obligatoire']
  },
  company_name: String,
  email: {
    type: String,
    validate: [isEmailOk, "L'email est invalide"],
    required: [true, "L'email est obligatoire"]
  },
  phone: {
    type: String,
    validate: [isPhoneOk, 'Le numéro de téléphone doit commencer par 0 ou +33'],
    required: [true, 'Le téléphone est obligatoire']
  },
  message: {
    type: String,
    required: [true, 'Le message est obligatoire']
  },
  subject: {
    type: String,
    required: [true, 'Le sujet est obligatoire']
  },
  document: {
    type: String,
    required: false,
  },
  treated: {
    type: Boolean,
    default: false,
    required: [true, 'Le statut est obligatoire']
  }
}, schemaOptions)

module.exports = CompanySchema;
