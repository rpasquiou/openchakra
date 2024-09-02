const mongoose = require('mongoose')
const {schemaOptions} = require('../../../utils/schemas')
const { idEqual, DUMMY_REF } = require('../../../utils/database')

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

ExpertiseSet.virtual('display_categories', DUMMY_REF).get(function() {
  return this.categories.map(cat => ({
    ...cat,
    expertises: cat.expertises?.filter(ce => this.expertises.some(e => idEqual(e._id, ce._id)))
  }))
})

/* eslint-enable prefer-arrow-callback */

module.exports = ExpertiseSet