const mongoose = require('mongoose')
const { MONGOOSE_OPTIONS, loadFromDb } = require('../../server/utils/database')
const User = require('../../server/models/User')
const Company = require('../../server/models/Company')
const { COMPANY_ACTIVITY_ASSURANCE, ROLE_EXTERNAL_DIET, QUIZZ_TYPE_ASSESSMENT } = require('../../server/plugins/smartdiet/consts')
const Offer = require('../../server/models/Offer')
const Quizz = require('../../server/models/Quizz')
const PriceList = require('../../server/models/PriceList')
const Coaching = require('../../server/models/Coaching')
const Appointment = require('../../server/models/Appointment')
const AppointmentType = require('../../server/models/AppointmentType')
const NutritionAdvice = require('../../server/models/NutritionAdvice')

require('../../server/plugins/smartdiet/functions')
describe('KPI Test', () => {
  let diet, company, offer, assessment_quizz, impact_quizz, priceList
  let coaching, appointment, appointmentType

  beforeAll(async () => {
    await mongoose.connect(`mongodb://localhost/smartdiet-test`, MONGOOSE_OPTIONS)

    // Create an AppointmentType (e.g., Suivi)
    appointmentType = await AppointmentType.create({
      smartagenda_id: '1',
      duration: 5,
      title: 'Suivi'
    })

    // Create a Company and associate it with the AppointmentType
    company = await Company.create({
      name: 'Test comp',
      activity: COMPANY_ACTIVITY_ASSURANCE,
      assessment_appointment_type: appointmentType._id
    })

    // Create a Diet (User with ROLE_EXTERNAL_DIET)
    diet = await User.create({
      firstname: 'John',
      lastname: 'Doe',
      email: 'john.doe@gmail.com',
      password: 'test',
      company: company._id,
      cguAccepted: true,
      dataTreatmentAccepted: true,
      pseudo: 'A',
      role: ROLE_EXTERNAL_DIET
    })

    // Create a Quizz for assessment
    assessment_quizz = await Quizz.create({
      name: 'Assessment Quizz',
      type: QUIZZ_TYPE_ASSESSMENT
    })

    // Create an Offer associated with the company and quizzes
    offer = await Offer.create({
      name: 'Test offer',
      price: 10,
      duration: 50,
      company: company._id,
      assessment_quizz,
      validity_start: new Date(),
      nutrition_price: 500,
    })

    // Create a PriceList entry with different prices
    priceList = await PriceList.create({
      nutrition: 500,
      followup: 2,
      assessment: 3,
      date: new Date()  // Ensure the date is before the appointments' dates
    })

    // Create Coaching and associate it with the offer and a new user
    coaching = await Coaching.create({
      offer,
      user: new mongoose.Types.ObjectId(),  // Dummy user ID
    })

    await NutritionAdvice.create({
      patient_email: `a@a.gmail.com`,
      diet,
      comment: 'Test comment'
    })
  })


  afterAll(async () => {
    await mongoose.connection.dropDatabase()
    await mongoose.connection.close()
  })

  it('must return diet billing', async() => {
    const data = await loadFromDb({model: 'billing', user:diet, fields:['test']})
    console.log(data)
  })
})
