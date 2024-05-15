const {forceDataModelSmartdiet}=require('../utils')
forceDataModelSmartdiet()

require('../../server/plugins/smartdiet/functions')
const {ROLE_ADMIN} = require('../../server/plugins/smartdiet/consts')

const moment=require('moment')
const mongoose = require('mongoose')
const {MONGOOSE_OPTIONS, loadFromDb} = require('../../server/utils/database')
const { upsertCustomer, createRecurrentPayment, upsertProduct, getCheckout, getSubscription, getInvoice } = require('../../server/plugins/payment/stripe')
const opn = require('opn')

describe('Stripe tests ', () => {

  let product_stripe_id, customer_stripe_id
  const EMAIL = 'test@wappizy.com'

  beforeAll(async() => {
  })

  afterAll(async() => {
  })

  it('must create a product', async() => {
    product_stripe_id = await upsertProduct({name: 'Test produit 17', description: 'Un paiement aujoudhui, ensuite 12'})
    console.log('product', product_stripe_id)
  })

  it('must create a customer', async() => {
    customer_stripe_id=await upsertCustomer({email: EMAIL})
    console.log('customer', customer_stripe_id)
  })

  it('must create a payment', async() => {
    const success_url='https://my-alfred.io'
    const failure_url='https://my-alfred.io'
    const res=await createRecurrentPayment({
      times:3, 
      amount: 10,
      customer_stripe_id, 
      product_stripe_id,
      customer_email: EMAIL,
      success_url, failure_url,
      internal_reference: 'test42',
    })
    console.log(res)
    opn(res.url)
  })

  it('must find the sub and checkout', async() => {
    const subId='sub_1PGGFRI6ihNkRdH8eMmGUpjJ'
    const checkoutId='cs_test_a1eIlUeVjNicprxF1rbRkW0fVSn9VyulNptKGzRBiOgiMyfWsjSsXuoB09'
    const sub=await getSubscription(subId)
    const checkout=await getCheckout(checkoutId)
    console.log(checkout)
    console.log(sub)
  })

})
