const { MONGOOSE_OPTIONS } = require('../../server/utils/database')
const mongoose = require('mongoose')
const { computeBilling } = require('../../server/plugins/smartdiet/billing_bis')

jest.setTimeout(60000)

describe('Billing Tests', () => {

  beforeAll(async () => {
    mongoose.set('bufferTimeoutMS', 30000)
    try {
      await mongoose.connect(`mongodb://localhost/smartdiet`, MONGOOSE_OPTIONS)
      console.log('Connected to MongoDB')
    } catch (error) {
      console.error('Error in connecting to MongoDB : ', error)
      throw error
    }
  })

  afterAll(async () => {
    try {
      await mongoose.connection.close()
    } catch (error) {
      console.error('Error in closing MongoDB connection : ', error)
      throw error
    }
  })

  it('must return diet with appointment', async() => {
    const resultat = await computeBilling()
    
    // console.log('\n### Résultat du calcul de facturation ###\n')
    
    console.log(JSON.stringify(resultat, null, 2))
  })
})
