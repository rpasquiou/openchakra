const { getDataModel, getDatabaseUri } = require('../../config/config')
const fs=require('fs')
const path=require('path')
const lodash=require('lodash')
const { MONGOOSE_OPTIONS, getModels } = require('../../server/utils/database')
const mongoose = require('mongoose')
require(`../../server/models/Chapter`)
require(`../../server/plugins/${getDataModel()}/functions`)

const loadSaveModel = async modelName => {
  console.log('checking model', modelName)
  const records=await mongoose.models[modelName].find()
  await Promise.all(records.map(async record => {
    return record.save()
      .catch(err => {
        err.message=`${record._id}:${err.message}`
        throw err
      })
  }))
}

const checkConsistency = async () => {
  console.log(`Opening ${getDatabaseUri()}`)
  await mongoose.connect(getDatabaseUri(), MONGOOSE_OPTIONS)
  const models=mongoose.modelNames().filter(name => /block/i.test(name))
  await Promise.all(Object.values(models).map(model => loadSaveModel(model)))
}

if (require.main === module) {
  checkConsistency()
    .then(() => console.log('Ok'))
    .catch(console.error)
}

module.exports={
  checkConsistency
}
