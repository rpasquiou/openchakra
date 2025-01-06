const mongoose = require('mongoose')
const {schemaOptions} = require('../../../utils/schemas')
const { PARTNER_LEVELS, MAX_WISHES } = require('../consts')
const { DUMMY_REF } = require('../../../utils/database')

const Schema = mongoose.Schema

const TableSchema = new Schema({
  tablemap: {
    type: Schema.Types.ObjectId,
    ref: 'tablemap',
    required: [true, `Le plan de table de la table est obligatoire`]
  },
  capacity: {
    type: Number,
    required: [true, `Le nombre de places est obligatoire`]
  },
  partner: {
    type: Schema.Types.ObjectId,
    ref: 'company',
    required: false
  },
  staff_number: {
    type: Number,
    required: true,
    default: 1,
    validate: [function (value) {return value > 0 && value + this.guest_number <= this.capacity}, `Le nombre de places pour le partenaire doit être compris entre 1 et la taille de la table`]
  },
  partner_level: {
    type: String,
    enum: Object.keys(PARTNER_LEVELS),
    required: false
  },
  wishes: {
    type: [{
      type: Schema.Types.ObjectId,
      ref: 'user',
      required: true
    }],
    required: false,
    validate: [function (value) {return value.length <= MAX_WISHES}, `Le nombre de voeux ne peut pas dépasser ${MAX_WISHES}`],
    default: []
  },
  guest_number: {
    type: Number,
    required: true,
    default: 0,
    validate: [function (value) {return value => 0 && (value + this.staff_number <= this.capacity)}, `Le nombre de places pour le partenaire doit être compris entre 1 et la taille de la table`]
  },
  guests: {
    type: [{
      type: Schema.Types.ObjectId,
      ref: 'user',
      required: true
    }],
    required: false,
    validate: [function (value) {return value.length <= this.guest_number}, function () { return `Le nombre d'invité.e.s ne peut pas dépasser ${this.guest_number}`}],
    default: []
  },
  staff: {
    type: [{
      type: Schema.Types.ObjectId,
      ref: 'user',
      required: true
    }],
    required: false,
    validate: [function (value) {return value.length <= this.staff_number}, function () { return `Le nombre d'invité.e.s ne peut pas dépasser ${this.staff_number}`}],
    default: []
  },
  assigned_users: {
    type: [{
      type: Schema.Types.ObjectId,
      ref: 'user',
      required: true
    }],
    required: false,
    default: []
  },
}, {...schemaOptions})

/* eslint-disable prefer-arrow-callback */

TableSchema.virtual('assigned_users_count', DUMMY_REF).get(function() {
  return this.assigned_users?.length || 0
})

/* eslint-enable prefer-arrow-callback */

module.exports= TableSchema