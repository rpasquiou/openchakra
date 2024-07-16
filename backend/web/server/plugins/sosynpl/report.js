const { BadRequestError } = require("../../utils/errors")
const moment=require('moment')
const Report = require('../../models/Report')
const { REPORT_STATUS, REPORT_STATUS_DRAFT, REPORT_STATUS_DISPUTE, REPORT_STATUS_SENT, REPORT_STATUS_ACCEPTED } = require("./consts")

// TODO: customer & freelance must have the required documents
const canAcceptReport = async reportId => {
  const report=await Report.findById(reportId)
  if (report.status!=REPORT_STATUS_SENT) {
    throw new BadRequestError(`Un rapport dans l'état ${REPORT_STATUS[report.status]} ne peut être accepté`)
  }
}

const acceptReport = async reportId => {
  const report=await Report.findById(reportId)
  report.accepted_date=moment()
  report.status=REPORT_STATUS_ACCEPTED
  return report.save()
}

const canRefuseReport = async reportId => {
  const report=await Report.findById(reportId)
  if (report.status!=REPORT_STATUS_SENT) {
    throw new BadRequestError(`Un rapport dans l'état ${REPORT_STATUS[report.status]} ne peut être refusé`)
  }
  return true
}

const refuseReport = async reportId => {
  const report=await Report.findById(reportId)
  report.refuse_date=moment()
  report.status=REPORT_STATUS_DISPUTE
  return report.save()
}

const canSendReport = async reportId => {
  const report=await Report.findById(reportId).populate({path: 'quotation', populate: 'details'})
  if (![REPORT_STATUS_DRAFT, REPORT_STATUS_DISPUTE].includes(report.status)) {
    throw new BadRequestError(`Un rapport dans l'état ${REPORT_STATUS[report.status]} ne peut être envoyé`)
  }
  if (!(report.quotation?.length>0)) {
    throw new BadRequestError(`Un rapport sans devis ne peut être envoyé`)
  }
  if (!(report.quotation[0].details.length>0)) {
    throw new BadRequestError(`Un rapport avec un devis incomplet ne peut être envoyé`)
  }
  return true
}

const sendReport = async reportId => {
  await Report.findByIdAndUpdate(reportId, {status: REPORT_STATUS_SENT, sent_date: moment()})
  // TODO: send bills : from sosynpl to customer & sosynpl to freelance for commissions, from freelance to customer
}


module.exports = {
  canAcceptReport, acceptReport, canSendReport, sendReport, canRefuseReport, refuseReport,
}