const { CREATED_AT_ATTRIBUTE, generate_id } = require('../../../utils/consts')
const {
  declareVirtualField,
} = require('../../utils/database')
const Deck = require('../../models/Deck')

declareVirtualField({model: 'deck', field: 'planks_count', instance: 'Number', requires: 'width,length,plank_width,plank_length,planks_spacing,piers_spacing'})
declareVirtualField({model: 'deck', field: 'piers_count', instance: 'Number', requires: 'width,length,plank_width,plank_length,planks_spacing,piers_spacing'})
declareVirtualField({model: 'deck', field: 'beams_count', instance: 'Number', requires: 'width,length,plank_width,plank_length,planks_spacing,piers_spacing'})
declareVirtualField({model: 'deck', field: 'steps', instance: 'String', requires: 'width,length,plank_width,plank_length,planks_spacing,piers_spacing'})
declareVirtualField({model: 'deck', field: 'beams_svg_path', instance: 'String', requires: 'width,length,plank_width,plank_length,planks_spacing,piers_spacing'})
declareVirtualField({model: 'deck', field: 'planks_svg_path', instance: 'String', requires: 'width,length,plank_width,plank_length,planks_spacing,piers_spacing'})
declareVirtualField({model: 'deck', field: 'beams_svg_contents', instance: 'String', requires: 'width,length,plank_width,plank_length,planks_spacing,piers_spacing'})
declareVirtualField({model: 'deck', field: 'planks_svg_contents', instance: 'String', requires: 'width,length,plank_width,plank_length,planks_spacing,piers_spacing'})

module.exports = {
}
