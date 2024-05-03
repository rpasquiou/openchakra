const Pack = require("../../models/Pack")
const Purchase = require("../../models/Purchase")

const paymentCb = async ({purchase: purchaseId, success}) => {
  console.log(`Purchase ${purchaseId} ${success ? 'OK': 'NOK'}`)
  if (success) {
    const purchase=await Purchase.findById(purchaseId).populate(['pack', {path: 'customer', populate: 'latest_coachings'}])
    const pack=await purchase.pack
    // If pack is only cs, link to latest coaching
    if (!pack.checkup) {
      const coaching=purchase.customer.latest_coachings[0]
      coaching.pack=purchase.pack
      return coaching.save()
    }
  }
  
}

module.exports={
  paymentCb
}