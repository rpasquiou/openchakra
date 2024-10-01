const path=require('path')
const myEnv = require('dotenv').config({path: path.resolve(__dirname, '../../../../.env')})
const { displayConfig } = require('../../config/config')
const moment = require('moment')
const { CREATED_AT_ATTRIBUTE } = require('../../utils/consts')
const {MONGOOSE_OPTIONS} = require('../../server/utils/database')
const {getDatabaseUri} = require('../../config/config')
const mongoose=require('mongoose')
const Appointment = require('../../server/models/Appointment')
const { formatDateTime } = require('../../utils/text')
const Company = require('../../server/models/Company')
require('../../server/plugins/smartdiet/functions')

const createCsvWriter = require('csv-writer').createObjectCsvWriter;

const HEADERS=[
  {title: 'Diet', id:'diet_name'},
  {title: 'Patient', id:'user_name'},
  {title: 'Date', id:'date'},
  {title: 'Type', id:'type'},
  {title: 'Début coaching', id:'coaching_start'},
]

const exportAppointments = async () => {
  await mongoose.connect(getDatabaseUri(), MONGOOSE_OPTIONS)
  const start=moment().add(-1, 'month').startOf('month')
  const end=moment().add(-1, 'month').endOf('month')
  console.log('*'.repeat(10), 'Generating from', start, 'to', end)
  const assessmentTypes=(await Company.find()).map(c => c.assessment_appointment_type?._id?.toString()).filter(v => !!v)
  let appts=await Appointment.find({start_date:{$gte: start, $lte: end}})
    .populate('diet')
    .populate('user')
    .populate({path: 'coaching', populate: 'offer'})
    .populate({path: 'progress', populate:'questions'})
  console.log('Before', appts.length)
  appts=appts.filter(a => !!a.diet)
  appts=appts.filter(a => a.progress.questions.some(q => !!q.single_enum_answer))
  console.log('After', appts.length)
  console.log()
  appts.forEach(a => {
    a.diet_name=a.diet.fullname
    a.user_name=a.user.fullname
    a.date=formatDateTime(a.start_date)
    a.type=assessmentTypes.includes(a.appointment_type._id.toString()) ? 'bilan':'suivi'
    a.coaching_start=formatDateTime(a.coaching[CREATED_AT_ATTRIBUTE])
  })
  const csvWriter = createCsvWriter({
    path: './AllSmartdiet.csv',
    header: HEADERS,
    fieldDelimiter: ';'
  })
  console.log(`Generated ${appts.length} appointments in AllSmartdiet.csv`)
  return csvWriter.writeRecords(appts)
}

exportAppointments()
  .then(r => {
    console.log(r)
    process.exit(0)
  })
  .catch(err => {
    console.error(err)
    process.exit(1)
  })
