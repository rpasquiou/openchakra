const mongoose = require('mongoose')
const lodash = require('lodash')
const {schemaOptions} = require('../../../utils/schemas')
const { ANSWER_NO, SCORE_LEVELS, QUESTION_CATEGORIES } = require('../consts')
const { DUMMY_REF } = require('../../../utils/database')

const Schema = mongoose.Schema

const ScoreSchema = new Schema({
  creator: {
    type: Schema.Types.ObjectId,
    ref: 'user',
    required: [true, `Le créateur du score est obligatoire`],
  },
  answers: {
    type: [{
      type: Schema.Types.ObjectId,
      ref: 'answer',
      required: true,
    }],
    default: []
  },
  global_rate: {
    type: Number,
    default: false
  },
  _category_rates: {
    type: [{
        type: Schema.Types.ObjectId,
        ref: 'categoryRate',
        required: true
    }],
    default: []
  },
  level: {
    type: String,
    enum: Object.keys(SCORE_LEVELS),
    required: [true, `Le niveau du score est obligatoire`]
  },
  questions_by_category: {
    type: [{
      category: {
        type: Schema.Types.ObjectId,
        ref: 'category'
      },
      answers: {
        type: [{
          type: Schema.Types.ObjectId,
          ref: 'answer'
        }]
      }
    }]
  },
  bellwether_count: {
    type: Number,
    default: 0
  },
  completed: {
    type: Boolean,
    required: true,
    default: false,
  },
  _market: {
    type: Boolean,
    default: false
  },
  category_rates: {
    type: [{
      type: Schema.Types.ObjectId,
      ref: 'triple'
    }]
  },
}, {...schemaOptions})

/* eslint-disable prefer-arrow-callback */

ScoreSchema.virtual('deviation', DUMMY_REF).get(function() {
  return this?.answers?.filter(a => a.answer==ANSWER_NO).length || 0
})

ScoreSchema.virtual('question_count',DUMMY_REF).get(function() {
  return this.answers?.length || 0
})

ScoreSchema.virtual('chart_data',DUMMY_REF).get(function() {
  const myData = []
  const labels = this._category_rates.map((elem) => {
    console.log("elem",elem);
    
    myData.push({label: elem.category.name, y: elem.rate*100})
    return elem.category.name
  })
  const series=[{
    name:'Mes données',
    values: myData,
    color: 'rgb(255,0,0)'
  },{
    name:'Market (WIP)',
    values: [{label: myData[1].label, y:8}],
    color: 'rgb(0,255,0)'
  }]
  return {labels, series}
})

/* eslint-enable prefer-arrow-callback */

module.exports = ScoreSchema