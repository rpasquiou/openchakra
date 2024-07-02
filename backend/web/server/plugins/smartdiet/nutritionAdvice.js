const axios = require("axios")
const mime=require('mime-types')
const moment=require('moment')
const { fillForm } = require("../../../utils/fillForm")
const { sendBufferToAWS } = require("../../middlewares/aws")
const NutritionAdvice=require('../../models/NutritionAdvice')
const { formatDate } = require("../../../utils/text")

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

module.exports={
  getNutAdviceCertificate,
}