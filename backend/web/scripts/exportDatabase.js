const mongoose=require('mongoose')
const moment=require('moment')
const path = require('path')
const fs=require('fs')
const lodash=require('lodash')
const {getDatabaseUri}=require('../config/config')
const { runPromisesWithDelay } = require('../server/utils/concurrency')
const { stringify }=require('csv-stringify/sync')
require('../server/models/Ingredient')
require('../server/models/Team')
require('../server/models/TeamMember')
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

const addData = (key, records) => {
  console.log('Adding', records.length, 'to', key)
  if (!!ModelData[key]) {
    throw new Error(`key ${key} exists`)
  }
  if (!ModelData[key]) {
    ModelData[key]=[]
  }
  ModelData[key]=records
}

const exportModel = async model => {
  const collectionName=model.collection.collectionName
  const modelName=model.modelName
  console.log(`Exporting ${modelName}/${collectionName}`)
  // Format date attributes
  const dateAttributes=lodash(model.schema.paths).values().filter(att => att.instance=='Date').map('path').value()
  // Array attributes
  const arrayAttributes=lodash(model.schema.paths).values().filter(att => att.instance=='Array').map('path').value()
  console.log(`${modelName} date:${dateAttributes} arrays:${arrayAttributes}`)
  let data=await model.collection.find({}).toArray()
  console.log('Loaded', data.length)
  // Set same keys to each record
  const allKeys=lodash(data).map(d => Object.keys(d)).flatten().uniq().map(k => [k, undefined]).fromPairs().value()
  data=data.map(d => ({...allKeys, ...d}))
  if (dateAttributes.length>0) {
    data=data.map(d => lodash.mapValues(d, (v, k) => dateAttributes.includes(k) && !!v ? moment(v).format('YYYY-MM-DD HH:mm:ss') : v))
  }
  const nonArrayData=data.map(d => lodash.omit(d, arrayAttributes))
  addData(collectionName, nonArrayData)
  arrayAttributes.forEach(arrayAttribute => {
    console.log('Generating for', arrayAttribute)
    const attData=[]
    data
      .filter(d => d[arrayAttribute]?.length>0)
      .forEach(d => {
        d[arrayAttribute].forEach(value => {
          attData.push({_id: d._id, [arrayAttribute.replace(/s$/, '')]: value})
        })
      })
    console.log('Generating for', arrayAttribute, ':', attData.length)
    if (attData.length>0) {
      addData(`${collectionName}_${arrayAttribute}`, attData)
    }
  })
}

const isDerivedModel = (model, models) => {
  return models.some(m => m.discriminators?.[model.modelName])
}

const exportDatabase = async (destinationDirectory) => {
    await mongoose.connect(getDatabaseUri())
    console.log('Connected to', getDatabaseUri())
    const models=Object.values(mongoose.models)
    let baseModels=models.filter(m => !isDerivedModel(m, models))
    // TEST
    baseModels=baseModels.filter(m => /userquizzques/i.test(m.modelName))
    // END TEST
    baseModels=lodash.sortBy(baseModels, m => m.modelName)
    console.log('Exporting models', baseModels.map(m => m.modelName))
    const res=await runPromisesWithDelay(baseModels.map(model => () => exportModel(model)))
    const errors=res.filter(r=> r.status=='rejected').map(r => r.reason)
    if (errors.length>0) {
      throw new Error(errors.join('\n'))
    }
    return Object.entries(ModelData)
      .filter(([, records]) => records.length>0)
      .map(([modelName, records]) => {
        const fileName=path.join(destinationDirectory,`${modelName}.csv`)
        console.log(`Exporting model ${modelName} to ${fileName}`)
        const stringified=stringify(records, {header:true, delimiter: ';'})
        fs.writeFileSync(fileName, stringified)      
      })
}

const destinationDir=process.argv[2]

if (!destinationDir) {
  console.error(`Usage: ${process.argv.join(' ')} <destination_directory>`)
  process.exit(1)
}

console.time('Exporting database')
exportDatabase(destinationDir)
  .then(() => console.timeEnd('Exporting database'))
  .catch(console.error)
  .finally(() => process.exit(0))