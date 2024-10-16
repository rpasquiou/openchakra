const path=require('path')
const lodash=require('lodash')
const { getDatabaseUri } = require('../../config/config')
const { MONGOOSE_OPTIONS } = require('../../server/utils/database')
const mongoose = require('mongoose')
const { loadRecords } = require('../../server/plugins/smartdiet/import')
const Appointment = require('../../server/models/Appointment')

const ROOT=path.join(__dirname, '../../tests/smartdiet/data/migration')
const APPT_PATH=path.join(ROOT, 'smart_consultation.csv')

// All appts not valid in import file having no progress must not be valid
const fixNeverValidated = async () => {
  const appointments = await loadRecords(APPT_PATH)
  // Get not validated appointments in import
  const invalidAppointments = (appointments)
    .filter(r => parseInt(r.status) <= 1)
    .map(r => r.SDCONSULTID)
  // Amongst them, find the ones whose progress are empty
  await Promise.all(invalidAppointments.map(async smartdiet_id => {
    const appt=await Appointment.findOne({migration_id: smartdiet_id}).populate({path: 'progress', populate: 'questions'})
    if (appt) {
      const someAnswered=appt.progress.questions.some(q => !!q.single_enum_answer)
      if (!appt.validated && !!someAnswered) {
        console.log(appt._id, 'to validate because not valid in import but progress changed')
        appt.validated=true
        return appt.save()
      }
    }
    else {
      console.log(`SDID ${smartdiet_id} introuvable`)
    }
  }))
}

// All appts not valid in import file having no progress must not be valid
const fixNotValidWithAnswers = async () => {
  // Find all not validated appointments but having answers
  const appts=await Appointment.find({validated: {$ne: true}}).populate({path: 'progress', populate: 'questions'})
  await Promise.all(appts.map(async appt => {
    const someAnswered=appt.progress.questions.some(q => !!q.single_enum_answer)
    if (someAnswered) {
      console.log(appt._id, 'to validate because not valid in DB but progress changed')
      appt.validated=true
      return appt.save()
  }
  }))
}

// All appts valid in import file must be valid in DB
const fixImportedStatus = async () => {
  const appointments = await loadRecords(APPT_PATH)
  const validAppointments = (appointments)
    .filter(r => parseInt(r.status) > 1)
    .map(r => r.SDCONSULTID)
  return Appointment.updateMany({ migration_id: { $in: validAppointments } }, { validated: true })
    .then(console.log)
}

const fixAppointmentStatus = async () => {
  await fixImportedStatus()
  await fixNeverValidated()
  await fixNotValidWithAnswers()
}
return mongoose.connect(getDatabaseUri(), MONGOOSE_OPTIONS)
  .then(() => fixAppointmentStatus())
  .then(console.log)
  .catch(console.error)
  .finally(() => process.exit())

