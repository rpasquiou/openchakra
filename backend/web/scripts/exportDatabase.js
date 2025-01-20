const mongoose=require('mongoose')
const moment=require('moment')
const path = require('path')
const fs=require('fs')
const lodash=require('lodash')
const {getDatabaseUri}=require('../config/config')
const { runPromisesWithDelay } = require('../server/utils/concurrency')
const { stringify }=require('csv-stringify')

//require('../server/models/AdminDashboard')
require('../server/models/Appointment')
require('../server/models/AppointmentStat')
require('../server/models/AppointmentType')
require('../server/models/Association')
require('../server/models/Availability')
require('../server/models/Billing')
require('../server/models/Category')
require('../server/models/ChallengePip')
require('../server/models/ChallengeUserPip')
require('../server/models/ChartPoint')
require('../server/models/CoachingLogbook')
require('../server/models/CoachingQuestion')
require('../server/models/Coaching')
require('../server/models/CoachingStat')
require('../server/models/CollectiveChallenge')
require('../server/models/Comment')
require('../server/models/Company')
require('../server/models/Content')
require('../server/models/Conversation')
require('../server/models/DeclineReason')
require('../server/models/DietComment')
require('../server/models/Diet')
require('../server/models/Diploma')
require('../server/models/Event')
require('../server/models/FoodDocument')
require('../server/models/Gift')
require('../server/models/GraphData')
require('../server/models/Group')
require('../server/models/History')
require('../server/models/IndividualChallenge')
require('../server/models/Ingredient')
require('../server/models/Instrument')
require('../server/models/Interest')
require('../server/models/Item')
require('../server/models/Job')
require('../server/models/JoinReason')
require('../server/models/Key')
require('../server/models/Lead')
// require('../server/models/LogbookDay')
require('../server/models/Measure')
require('../server/models/MenuRecipe')
require('../server/models/Menu')
require('../server/models/Message')
require('../server/models/Network')
require('../server/models/NutritionAdvice')
require('../server/models/Offer')
require('../server/models/Pack')
require('../server/models/PartnerApplication')
require('../server/models/Patient')
require('../server/models/Pip')
require('../server/models/PriceList')
require('../server/models/Question')
require('../server/models/QuizzQuestion')
require('../server/models/Quizz')
require('../server/models/Range')
require('../server/models/RecipeIngredient')
require('../server/models/Recipe')
// require('../server/models/ResetToken')
require('../server/models/SpoonGain')
require('../server/models/Target')
require('../server/models/TeamMember')
require('../server/models/Team')
require('../server/models/TicketComment')
require('../server/models/Ticket')
require('../server/models/UserCoachingQuestion')
require('../server/models/UserQuestion')
require('../server/models/UserQuizzQuestion')
require('../server/models/UserQuizz')
require('../server/models/User')
require('../server/models/UserSurvey')
require('../server/models/Webinar')

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

const createStringifier = (filename, attributes) => {
  const fileStream = fs.createWriteStream(filename)
  const stringifier=stringify({delimiter: ';', header: true, columns: attributes})
  stringifier.on('readable', function(){
    let row
    while((row = stringifier.read()) !== null){
      fileStream.write(row.toString()+'\r')
    }
  })
  return stringifier
}

const exportModel = async (model, folder) => {

  const collectionName=model.collection.collectionName
  const modelName=model.modelName
  console.log(`\nExporting ${modelName}/${collectionName}`)

  const length=await model.collection.countDocuments({})

  if (length==0) {
    console.log(`No data for ${modelName}, skipping`)
    return
  }

  const attributes=Object.keys(model.schema.paths).sort()
  // Format date attributes
  const dateAttributes=lodash(model.schema.paths).values().filter(att => att.instance=='Date').map('path').value()
  // Array attributes
  const arrayAttributes=lodash(model.schema.paths).values().filter(att => att.instance=='Array').map('path').value()
  const nonArayAttributes=attributes.filter(a => !arrayAttributes.includes(a))
  console.group()
  console.log(`date attributes:${dateAttributes}`)
  console.log(`array attributes:${arrayAttributes}`)

  const mainStringifier=createStringifier(path.join(folder, `${collectionName}.csv`), nonArayAttributes)
  const arrayStringfiers=(await Promise.all(arrayAttributes.map(async arrayAttribute => {
    const fileName=path.join(folder, `${collectionName}_${arrayAttribute}.csv`)
    const stringifier=createStringifier(fileName, ['_id', arrayAttribute])
    return [arrayAttribute, stringifier]
  }))).filter(Boolean)

  console.log('# documents', length)
  const cursor=model.collection.find({})
  
  let start=moment()
  let count=0
  while (await cursor.hasNext()) {
    count++
    if (count%10000==0 && (moment()-start)>=3000){
      console.log(count, '/', length)
      start=moment()
    }
    const d=await cursor.next()
    // Format date attributes
    dateAttributes.forEach(dateAttribute => {
      if (d[dateAttribute]) {
        d[dateAttribute]=moment(d[dateAttribute]).format('YYYY-MM-DD HH:mm:ss')
      }
    })
    mainStringifier.write(d)
    arrayStringfiers.forEach(([attribute, stringifier]) => {
      const value=d[attribute]
      value?.length>0 && value.forEach(v => {
        stringifier.write({_id: d._id, [attribute]: v})
      })
    })
  }
  console.groupEnd()
  console.log('Finished', collectionName)
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
    // baseModels=baseModels.filter(m => (!['userQuizzQuestion'].includes(m.modelName)))
    // END TEST
    baseModels=lodash.sortBy(baseModels, m => m.modelName)
    console.log('Exporting models', baseModels.map(m => m.modelName))
    const res=await runPromisesWithDelay(baseModels.map(model => () => exportModel(model, destinationDirectory)))
    const errors=res.filter(r=> r.status=='rejected').map(r => r.reason)
    if (errors.length>0) {
      throw new Error(errors.join('\n'))
    }
}

const destinationDir=process.argv[2]

if (!destinationDir) {
  console.error(`Usage: ${process.argv.join(' ')} <destination_directory>`)
  process.exit(1)
}

console.time('Exporting database')
console.time('export database')
exportDatabase(destinationDir)
  .then(() => console.timeEnd('Exporting database'))
  .catch(console.error)
  .finally(() => {
    console.timeEnd('export database')
    process.exit(0)
  })