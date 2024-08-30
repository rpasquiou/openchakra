const mongoose = require('mongoose')
const {schemaOptions} = require('../../../utils/schemas')
const { idEqual } = require('../../../utils/database')

const Schema = mongoose.Schema

const ExpertiseSet = new Schema({
  categories: {
    type: [{
      type: Schema.Types.ObjectId,
      ref: 'category',
      required: true,
    }],
    default: []
  },
  expertises: {
    type: [{
      type: Schema.Types.ObjectId,
      ref: 'expertise',
      required: true,
    }],
    default: []
  }
}, schemaOptions)

/* eslint-disable prefer-arrow-callback */

ExpertiseSet.virtual('dispay_expertises', DUMMY_REF).get(function() {
  return this.categories.map(function (cat) {cat.find(function (ce) {this.expertises.some(e => idEqual(ce,e))})})
})

/* eslint-enable prefer-arrow-callback */

module.exports = ExpertiseSet