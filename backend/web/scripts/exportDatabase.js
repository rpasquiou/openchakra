const mongoose=require('mongoose')
const moment=require('moment')
const fs=require('fs')
const lodash=require('lodash')
const {getDatabaseUri}=require('../config/config')
const { runPromisesWithDelay } = require('../server/utils/concurrency')
const { stringify }=require('csv-stringify/sync')
require('../server/models/Ingredient')
require('../server/models/Team')
require('../server/models/Instrument')
require('../server/models/Interest')
require('../server/models/MenuRecipe')
require('../server/models/FoodDocument')
require('../server/models/Network')
require('../server/models/PartnerApplication')
require('../server/models/Gift')
require('../server/models/Group')
require('../server/models/Diet')
require('../server/models/Prestation')
require('../server/models/Recipe')
require('../server/models/RecipeIngredient')
require('../server/models/Diploma')
require('../server/models/Patient')
require('../server/models/Group')
require('../server/models/TeamMember')
require('../server/models/Pip')
require('../server/models/ChallengePip')
require('../server/plugins/smartdiet/functions')

const ModelData = {}

const addData = async (model, records) => {
  (ModelData[model] = ModelData[model] || []).push(...records);
}

const mapArray = (model, localField, foreignField) =>
  ({record,value}) => {
    const mapped=(value||[]).map(v => ({[localField]: record._id, [foreignField]:v}))
    addData(model, mapped)
  }
const mapRecord = async (mapping, record) => {
  const res={...record}
  Object.entries(mapping).forEach(([key, mappingFn]) => {
    res[key]=mappingFn({record, value:res[key]})      
  })
  return res
}

const exportModel = async model => {
  const collectionName=model.collection.collectionName
  const modelName=model.modelName
  const msg=`Exporting ${collectionName}`
  console.time(msg)
  const nonVirtual=Object.keys(model.schema.paths).filter(att => !/^__/.test(att))
  const data=await model.find({}, Object.fromEntries(nonVirtual.map(v => [v, 1]))).lean()
  const mapping=lodash({...model.schema.paths})
    .values()
    .filter(attDef => attDef.instance=='Array' || attDef.instance=='Date')
    .map(attDef => [attDef.path, attDef.instance=='Array' ? mapArray(`${modelName}_${attDef.path}`, `${collectionName}_id`, attDef.path) : ({value}) => value && moment(value) || value])
    .fromPairs()
    .value()
  const mapped=await Promise.all(data.map(d => mapRecord(mapping, d)))
  await addData(collectionName, mapped)
  console.timeEnd(msg)
}

const exportDatabase = async () => {
    await mongoose.connect(getDatabaseUri())
    console.log('connected to', getDatabaseUri())
    const models=mongoose.modelNames().sort()
    await runPromisesWithDelay(models.map(modelName => () => {
      return exportModel(mongoose.models[modelName])
    }))
    Object.entries(ModelData)
      .filter(([modelName, records]) => records.length>0)
      .map(([modelName, records]) => {
      const fileName=`${modelName}.csv`
      const stringified=stringify(records, {header:true, delimiter: ';'})
      fs.writeFileSync(fileName, stringified)      
    })
}

console.time('Exporting database')
exportDatabase()
  .then(() => console.timeEnd('Exporting database'))
  .catch(console.error)
  .finally(() => process.exit(0))