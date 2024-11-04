const path=require('path')
const myEnv = require('dotenv').config({path: path.resolve(__dirname, '../../../../.env')})
const { displayConfig } = require('../../config/config')
const moment = require('moment')
const { CREATED_AT_ATTRIBUTE, UPDATED_AT_ATTRIBUTE } = require('../../utils/consts')
const {MONGOOSE_OPTIONS} = require('../../server/utils/database')
const {getDatabaseUri} = require('../../config/config')
const mongoose=require('mongoose')
const Lead = require('../../server/models/Lead')
const Appointment = require('../../server/models/Appointment')
require('../../server/models/User')
const { formatDateTimeShort } = require('../../utils/text')
const { CALL_STATUS, COACHING_CONVERSION_STATUS } = require('../../server/plugins/smartdiet/consts')
require('../../server/models/User')
require('../../server/models/Interest')

const createCsvWriter = require('csv-writer').createObjectCsvWriter;

const HEADERS=[
  {title: 'Date injection', id:'injection_date'},
  {title: 'Date maj', id:'update_date'},
  {title: 'Dernier status', id:'last_status'},
  {title: 'Opérateur', id:'operator_name'},
  {title: 'Code entreprise', id:'company_code'},
  {title: 'Campagne', id:'campain'},
  {title: 'Coaching', id:'led_coaching'},
  {title: '1er RV', id:'appt_date'},
  {title: 'Intéressé(e) par', id:'interests'},
]

const exportOutcalls = async () => {
  await mongoose.connect(getDatabaseUri(), MONGOOSE_OPTIONS)
  const start=moment().add(-1, 'month').startOf('month')
  const end=moment().add(-1, 'month').endOf('month')
  console.log('*'.repeat(10), 'Generating from', start, 'to', end)
  const leads=await Lead.find({[CREATED_AT_ATTRIBUTE]:{$gte: start, $lte: end}})
    .populate('operator')
    .populate('registered_user')
    .populate('interested_in')
    .lean({virtuals: true})
  await Promise.all(leads.map(async a => {
    a.injection_date=formatDateTimeShort(a[CREATED_AT_ATTRIBUTE])
    a.update_date=formatDateTimeShort(a[UPDATED_AT_ATTRIBUTE])
    a.last_status=CALL_STATUS[a.call_status]
    a.operator_name=a.operator?.fullname
    a.led_coaching=COACHING_CONVERSION_STATUS[a.coaching_converted]
    a.interests=a.interested_in?.map(i => i.name).join(',')
    const user=a.registered_user
    if (user) {
      const appts=Appointment.find({user}).sort({[CREATED_AT_ATTRIBUTE]:1})
      a.appt_date=appts.length>0 ? formatDateTimeShort(appts[0]) : undefined
    }
  }))
  const csvWriter = createCsvWriter({
    path: './outcalls.csv',
    header: HEADERS,
    fieldDelimiter: ';'
  })
  console.log(`Generated ${leads.length} leads in outcalls.csv`)
  return csvWriter.writeRecords(leads)
}

exportOutcalls()
  .then(() => process.exit(0))
  .catch(err => {
    console.error(err)
    process.exit(1)
  })
