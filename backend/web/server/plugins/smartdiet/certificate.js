const mime=require('mime-types')
const moment=require('moment')
const { fillForm } = require("../../../utils/fillForm")
const { sendBufferToAWS } = require("../../middlewares/aws")
const NutritionAdvice=require('../../models/NutritionAdvice')
const { formatDate } = require("../../../utils/text")
const Appointment = require("../../models/Appointment")
const { CREATED_AT_ATTRIBUTE } = require("../../../utils/consts")
const { COACHING_STATUS_FINISHED } = require("./consts")
const Coaching = require("../../models/Coaching")

const getNutAdviceCertificate = async (userId, params, data) => {
  // Don't generate before the appointment
  if (moment().isBefore(data.start_date)) {
    return null
  }

  // Don't regenerate if pdf exists
  if (!!data._certificate) {
    return data._certificate
  }

  const user=data._user
  if (!user) {
    throw new Error(`No registered user for nutrition advice ${data._id}`)
  }
  if (!user.company.nutadvice_certificate_template) {
    console.warn(`No nutrition advice certificate template for company ${user.company.name}`)
    return null
  }
  const pdfData={firstname: user.firstname, lastname: user.lastname, date: formatDate(data.start_date)}
  const pdf=await fillForm(data._user.company.nutadvice_certificate_template, pdfData)
  const buffer=await pdf.save()
  const filename=`nutadvice_certificate_${data._id}.pdf`
  const {Location}=await sendBufferToAWS({filename, buffer, type: 'certificate', mimeType: mime.lookup(filename)})
  await NutritionAdvice.findByIdAndUpdate(data._id, {_certificate: Location})
  return Location
}

const getAssessmentCertificate = async (userId, params, data) => {
 
  // Don't regenerate if pdf exists
  if (!!data._assessment_certificate) {
    return data._assessment_certificate
  }

  // Don't generate if no assessment appointment was validated
  const appts = await Appointment.find({coaching: data._id, order:1}).sort({[CREATED_AT_ATTRIBUTE]:1})

  if(!appts[0]) {
    console.warn(data._id, 'No assessment appointment found')
    return undefined
  }
  if (moment().isBefore(appts[0].start_date)) {
    console.warn(data._id, 'Assessment in the future')
    return undefined
  }

  if (!appts[0].validated) {
    console.warn(data._id, 'Assessment not validated')
    return undefined
  }

  const user=data.user

  if (!user) {
    throw new Error(`No user for coaching ${data._id}`)
  }

  if (!user.company.assessment_certificate_template) {
    console.warn(`No assessment certificate template for company ${user.company.name}`)
    return null
  }
  const pdfData={firstname: user.firstname, lastname: user.lastname, date: formatDate(data.start_date)}
  const pdf=await fillForm(user.company.assessment_certificate_template, pdfData)
  const buffer=await pdf.save()
  const filename=`assessment_certificate_${data._id}.pdf`
  const {Location}=await sendBufferToAWS({filename, buffer, type: 'certificate', mimeType: mime.lookup(filename)})
  await Coaching.findByIdAndUpdate(data._id, {_assessment_certificate: Location})
  return Location
}

const getFinalCertificate = async (userId, params, data) => {
 // Don't regenerate if pdf exists
  if (!!data._final_certificate) {
    return data._final_certificate
  }

  if (data.status!=COACHING_STATUS_FINISHED) {
    console.warn(data._id, 'Coaching not finished')
    return undefined
  }

  const user=data.user

  if (!user) {
    throw new Error(`No user for coaching ${data._id}`)
  }

  if (!user.company.coaching_certificate_template) {
    console.warn(`No coaching certificate template for company ${user.company.name}`)
    return null
  }
  const pdfData={firstname: user.firstname, lastname: user.lastname, date: formatDate(moment())}
  const pdf=await fillForm(user.company.coaching_certificate_template, pdfData)
  const buffer=await pdf.save()
  const filename=`final_certificate_${data._id}.pdf`
  const {Location}=await sendBufferToAWS({filename, buffer, type: 'certificate', mimeType: mime.lookup(filename)})
  await Coaching.findByIdAndUpdate(data._id, {_final_certificate: Location})
  return Location
}

module.exports={
  getNutAdviceCertificate, getAssessmentCertificate, getFinalCertificate,
}