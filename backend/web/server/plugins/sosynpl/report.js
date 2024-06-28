const { BadRequestError } = require("../../utils/errors")
const { REPORT_STATUS } = require("./consts")

// TODO: customer & freelance must have the required documents
const canAcceptReport = async reportId => {
  const report=await Report.findById(erportId)
  if (report.status!=REPORT_STATUS_SENT) {
    throw new BadRequestError(`Un report dans l'état ${REPORT_STATUS[report.status]} ne peut être accepté`)
  }
}


module.exports = {
  canAcceptReport,
}