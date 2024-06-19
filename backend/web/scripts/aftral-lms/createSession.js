const mongoose=require('mongoose')
const path=require('path')
const fs=require('fs')
const lodash=require('lodash')
const moment=require('moment')
const { MONGOOSE_OPTIONS } = require('../../server/utils/database')
const { ROLE_FORMATEUR, ROLE_APPRENANT } = require('../../server/plugins/aftral-lms/consts')
const Program = require('../../server/models/Program')
const User = require('../../server/models/User')
const Session = require('../../server/models/Session')
const { lockSession } = require('../../server/plugins/aftral-lms/functions')
const Block = require('../../server/models/Block')

// Import all data models
const modelsPath=path.join(__dirname, '../../server/models')
fs.readdirSync(modelsPath).forEach(file => {
  if (file.endsWith('.js')) {
    const modelName = path.basename(file, '.js')
    require(path.join(modelsPath, file))
  }
})

require('../../server/plugins/aftral-lms/functions')


const createSession = async (program_name, trainersTrainees) => {
  await mongoose.connect(`mongodb://localhost/aftral-lms`, MONGOOSE_OPTIONS)
  const program=await Program.findOne({name: program_name})
  if (!program) {
    throw new Error(`Program ${program_name} not found`)
  }
  const users=await User.find({email: {$in: trainersTrainees}})
  if (users.length<trainersTrainees.length) {
    const missing=lodash.difference(trainersTrainees, users.map(u => u.email))
    throw new Error(`Missing accounts ${missing}`)
  }
  const trainers=users.filter(u => u.role==ROLE_FORMATEUR)
  const trainees=users.filter(u => u.role==ROLE_APPRENANT)
  if (lodash.isEmpty(trainers)) {
    throw new Error(`At least one trainer is required`)
  }
  if (lodash.isEmpty(trainees)) {
    throw new Error(`At least one trainee is required`)
  }
  let session=await Session.create({
    start_date: moment(), end_date: moment().add(1, 'month'),
    name: program.name,
    trainers, trainees,
    actual_children: [program._id]
  })
  await lockSession(session._id)
  session=await Session.findById(session._id)
  console.log(program._id, session.children[0])
}

const parameters=process.argv.slice(2)
if (parameters.length<3) {
  console.error(`Usage: ${process.argv[0]} ${process.argv[1]} <program_name> <trainer_email> <trainee_email>`)
  process.exit(1)
}

createSession(parameters[0], parameters.slice(1))
  .then(console.log)
  .catch(console.error)
  .finally(() => process.exit(0))

