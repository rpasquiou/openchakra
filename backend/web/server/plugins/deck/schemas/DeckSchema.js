const mongoose = require('mongoose')
const moment = require('moment')
const {schemaOptions} = require('../../../utils/schemas')
const util=require('util')
const {computePlanksCount, computePiersCount, computeBeamsCount, computeSteps, computePlanksSvg, computeBeamsSvg}=require('../computation')

const Schema = mongoose.Schema

const DeckSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
    width: {
      type: Number,
      required: true,
    },
    length: {
      type: Number,
      required: true,
    },
    plank_width: {
      type: Number,
      required: true,
    },
    plank_length: {
      type: Number,
      required: true,
    },
    planks_spacing: {
      type: Number,
      required: true,
    },
    piers_spacing: {
      type: Number,
      required: true,
    },
    beam_length: {
      type: Number,
      required: true,
    },
    beam_width: {
      type: Number,
      required: true,
    },
    quincunx: {
      type: Boolean,
      required: true,
    },
  },
  schemaOptions,
)

DeckSchema.virtual('planks_count').get(function() {
  return computePlanksCount(this)
})

DeckSchema.virtual('piers_count').get(function() {
  return computePiersCount(this)
})

DeckSchema.virtual('beams_count').get(function() {
  return computeBeamsCount(this)
})

DeckSchema.virtual('steps').get(function() {
  return computeSteps(this)
})

DeckSchema.virtual('beams_svg_path').get(function() {
  return `/myAlfred/api/studio/contents/deck/${this.id}/beams_svg_contents?m=${moment().unix()}`
})

DeckSchema.virtual('planks_svg_path').get(function() {
  return `/myAlfred/api/studio/contents/deck/${this.id}/planks_svg_contents?m=${moment().unix()}`
})

DeckSchema.virtual('planks_svg_contents').get(function() {
  return computePlanksSvg(this)
})

DeckSchema.virtual('beams_svg_contents').get(function() {
  return computeBeamsSvg(this)
})

DeckSchema.methods.toString = function() {
  return `${this.name}:L${this.length}xl${this.width},lames L${this.plank_length}xl${this.plank_width}, ${this.planks_spacing} entre les lames, ${this.piers_spacing} entre les plots ${this.quincunx ? 'en quinconce': 'en carré'}
 lames nécessaires:${this.planks_count}
 lambourdes nécessaires:${this.beams_count}
 plots nécessaires:${this.piers_count}`
}

module.exports = DeckSchema
