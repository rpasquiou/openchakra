const mongoose = require('mongoose')
const {getDataModel} = require('../../config/config')
const {customizeSchema}=require('../../server/utils/database')

let ThemeSchema=null

try {
  ThemeSchema=require(`../plugins/${getDataModel()}/schemas/ThemeSchema`)
  customizeSchema(ThemeSchema)
}
catch(err) {
  if (err.code !== 'MODULE_NOT_FOUND') {
    throw err
  }
}

module.exports = ThemeSchema ? mongoose.model('theme', ThemeSchema) : null
