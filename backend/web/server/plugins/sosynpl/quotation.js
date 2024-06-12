const Quotation = require("../../models/Quotation")
const { ForbiddenError } = require("../../utils/errors")
const { QUOTATION_STATUS_SENT, QUOTATION_STATUS_DRAFT } = require("./consts")

const sendQuotation = async quotationId => {
  const quotation=await Quotation.findById(quotationId)
  if (quotation.status!=QUOTATION_STATUS_DRAFT) {
    throw new ForbiddenError(`Ce devis a déjà été envoyé`)
  }
  quotation.status=QUOTATION_STATUS_SENT
  await quotation.save()
}

module.exports={
  sendQuotation,
}