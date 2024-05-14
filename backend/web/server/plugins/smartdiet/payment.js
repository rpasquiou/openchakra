const moment=require('moment')
const { paymentPlugin } = require("../../../config/config")
const { PURCHASE_STATUS_COMPLETE } = require("../../../utils/consts")
const Pack = require("../../models/Pack")
const Purchase = require("../../models/Purchase")
const { COACHING_STATUS_STARTED } = require("./consts")

const paymentCb = async ({checkout_id, success}) => {
  console.log(`Checkout ${checkout_id} ${success ? 'OK': 'NOK'}`)
  const checkout=await paymentPlugin.getCheckout(checkout_id)
  const purchase=await Purchase.findById(checkout.client_reference_id)
    .populate(['pack', {path: 'customer', populate: {path: 'latest_coachings', populate: 'spent_credits'}}])
  if (success) {
    const pack=purchase.pack
    // Update purchase status
    await Purchase.findByIdAndUpdate(purchase._id, {status: PURCHASE_STATUS_COMPLETE})
    // Set subscription cancel_date
    if (!!checkout.subscription_id) {
      await paymentPlugin.setSubscriptionEnd({
        subscription_id: checkout.subscription.id,
        end_date: moment().add(pack.payment_count-1, 'month').add(1, 'day')
      })
    }
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