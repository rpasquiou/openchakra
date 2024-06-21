const mongoose=require('mongoose')
const moment=require('moment')
const { MONGOOSE_OPTIONS, loadFromDb } = require('../../server/utils/database')
const Quotation = require('../../server/models/Quotation')
const QuotationDetail=require('../../server/models/QuotationDetail')
require('../../server/models/Application')
require('../../server/models/Job')
require('../../server/models/JobFile')
require('../../server/models/Sector')

require('../../server/plugins/sosynpl/functions')

describe('Test commission computing', () => {

  beforeAll(async () => {
    const DBNAME=`test${moment().unix()}`
    await mongoose.connect(`mongodb://localhost/${DBNAME}`, MONGOOSE_OPTIONS)
  })
  
  afterAll(async () => {
    await mongoose.connection.dropDatabase()
    await mongoose.connection.close()
  })

  it('must compute all', async () => {
    const [quotation]=await Quotation.create([{
      start_date: moment(),
      end_date: moment().add(2, 'month'),
      expiration_date: moment().add(3, 'month'),
    }], {validateBeforeSave: false})
    await QuotationDetail.create({
      quotation,
      quantity: 10,
      price: 20,
      label: 'hop',
      vat_rate: 0.2,
    })
    const fns=[() => Quotation.findById(quotation._id).populate('details'),
      async() => (await loadFromDb({model: 'quotation', id: quotation._id, 
      fields:['quantity_total','average_daily_rate_ht','average_daily_rate_ttc','ht_total','ttc_total','vat_total','ht_freelance_commission','ttc_freelance_commission','vat_freelance_commission','ttc_net_revenue','ht_net_revenue','ht_customer_commission','ttc_customer_commission','vat_customer_commission']}))[0]]
    const test=fns.map(fn => fn()
      .then(loaded => {
        expect(loaded.quantity_total).toEqual(10)
        expect(loaded.average_daily_rate_ht).toEqual(20)
        expect(loaded.average_daily_rate_ttc).toEqual(24)
        expect(loaded.ht_total).toEqual(200)
        expect(loaded.ttc_total).toEqual(240)
        expect(loaded.vat_total).toEqual(40)
        expect(loaded.ht_freelance_commission).toEqual(10)
        expect(loaded.ttc_freelance_commission).toEqual(12)
        expect(loaded.vat_freelance_commission).toEqual(2)
        expect(loaded.ttc_net_revenue).toEqual(228)
        expect(loaded.ht_net_revenue).toEqual(190)
        expect(loaded.ht_customer_commission).toEqual(30)
        expect(loaded.ttc_customer_commission).toEqual(36)
        expect(loaded.vat_customer_commission).toEqual(6)
      }))
    return Promise.all(test)
  })

})

