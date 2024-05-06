const Pack = require("../../models/Pack")
const Purchase = require("../../models/Purchase")
const { COACHING_STATUS_STARTED } = require("./consts")

const paymentCb = async ({purchase: purchaseId, success}) => {
  console.log(`Purchase ${purchaseId} ${success ? 'OK': 'NOK'}`)
  if (success) {
    const purchase=await Purchase.findById(purchaseId).populate(['pack', {path: 'customer', populate: {path: 'latest_coachings', populate: 'spent_credits'}}])
    const pack=await purchase.pack
    // If pack is only cs, link to latest coaching
    if (!pack.checkup) {
      const coaching=purchase.customer.latest_coachings[0]
      coaching.pack=purchase.pack
      coaching._company_cedits_spent=purchase.customer.latest_coachings[0].spent_credits
      coaching.status=COACHING_STATUS_STARTED
      return coaching.save()
    }
  }
  
}

module.exports={
  paymentCb
}