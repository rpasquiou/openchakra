const {forceDataModelSmartdiet}=require('../utils')
forceDataModelSmartdiet()

require('../../server/plugins/smartdiet/functions')
const {ROLE_ADMIN} = require('../../server/plugins/smartdiet/consts')

const moment=require('moment')
const mongoose = require('mongoose')
const {MONGOOSE_OPTIONS, loadFromDb} = require('../../server/utils/database')
const { upsertCustomer, createReccurrentPayment, upsertProduct } = require('../../server/plugins/payment/stripe')

describe('Stripe tests ', () => {

  let product_stripe_id, customer_stripe_id
  beforeAll(async() => {
  })

  afterAll(async() => {
  })

  it('must create a product', async() => {
    product_stripe_id = await upsertProduct({name: 'Test produit'})
    console.log('product', product_stripe_id)
  })

  it('must create a customer', async() => {
    customer_stripe_id=await upsertCustomer({email: 'test@wappizy.com'})
    console.log('customer', customer_stripe_id)
  })

  it('must create a payment', async() => {
    const success_url='https://my-alfred.io'
    const failure_url='https://my-alfred.io'
    await createReccurrentPayment({
      times:3, 
      amount: 10,
      customer_stripe_id, 
      product_stripe_id,
      success_url, failure_url
    })
  })

})
