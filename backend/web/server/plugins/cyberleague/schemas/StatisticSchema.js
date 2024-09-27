const mongoose = require('mongoose')
const {schemaOptions} = require('../../../utils/schemas')


const Schema = mongoose.Schema

const StatisticSchema = new Schema({

}, schemaOptions  )

module.exports = StatisticSchema