const { BadRequestError } = require("../../utils/errors")
const moment=require('moment')
const Report = require('../../models/Report')
const { REPORT_STATUS, REPORT_STATUS_DRAFT, REPORT_STATUS_DISPUTE, REPORT_STATUS_SENT, REPORT_STATUS_ACCEPTED } = require("./consts")

// TODO: customer & freelance must have the required documents
const canAcceptReport = async reportId => {
  const report=await Report.findById(erportId)
  if (report.status!=REPORT_STATUS_SENT) {
    throw new BadRequestError(`Un rapport dans l'état ${REPORT_STATUS[report.status]} ne peut être accepté`)
  }
}

const acceptReport = async reportId => {
  return Report.findByIdAndUpdate(reportId, {status: REPORT_STATUS_ACCEPTED, accept_date: moment()})
}

const canRefuseReport = async reportId => {
  const report=await Report.findById(erportId)
  if (report.status!=REPORT_STATUS_SENT) {
    throw new BadRequestError(`Un rapport dans l'état ${REPORT_STATUS[report.status]} ne peut être refusé`)
  }
}

const refuseReport = async reportId => {
  return Report.findByIdAndUpdate(reportId, {status: REPORT_STATUS_DISPUTE, accept_date: moment()})
}

const canSendReport = async reportId => {
  const report=await Report.findById(reportId).poulate({path: 'quotation', populate: 'details'})
  if (![REPORT_STATUS_DRAFT, REPORT_STATUS_DISPUTE].includes(report)) {
    throw new BadRequestError(`Un rapport dans l'état ${REPORT_STATUS[report.status]} ne peut être envoyé`)
  }
}

const sendReport = async reportId => {
  await Report.findByIdAndUpdate(reportId, {status: REPORT_STATUS_SENT, sent_date: moment()})
  // TODO: send bills : from sosynpl to customer & sosynpl to freelance for commissions, from freelance to customer
}


module.exports = {
  canAcceptReport, acceptReport, canSendReport, sendReport, canRefuseReport, refuseReport,
}