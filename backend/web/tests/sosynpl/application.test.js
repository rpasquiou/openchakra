const mongoose = require('mongoose')
const ApplicationSchema = require('../../server/plugins/sosynpl/schemas/ApplicationSchema')
const { APPLICATION_STATUS_DRAFT, APPLICATION_VISIBILITY_HIDDEN, APPLICATION_VISIBILITY_VISIBLE } = require('../../server/plugins/sosynpl/consts')

describe('ApplicationSchema', () => {
  let connection
  let Application

  beforeAll(async () => {
    connection = await mongoose.connect('mongodb://localhost:27017/testdb', { useNewUrlParser: true, useUnifiedTopology: true })
    Application = mongoose.model('application', ApplicationSchema)
  })

  afterAll(async () => {
    await mongoose.connection.db.dropDatabase()
    await mongoose.connection.close()
  })

  it('should create an application', async () => {
    const applicationData = {
      announce: new mongoose.Types.ObjectId(),
      freelance: new mongoose.Types.ObjectId(),
      why_me: 'I am the best fit for this job',
      sent_date: new Date(),
      status: APPLICATION_STATUS_DRAFT,
      visibility_status: APPLICATION_VISIBILITY_VISIBLE
    }

    const application = new Application(applicationData)
    const savedApplication = await application.save()

    expect(savedApplication._id).toBeDefined()
    expect(savedApplication.announce).toEqual(applicationData.announce)
    expect(savedApplication.freelance).toEqual(applicationData.freelance)
    expect(savedApplication.why_me).toBe(applicationData.why_me)
    expect(savedApplication.sent_date).toEqual(applicationData.sent_date)
    expect(savedApplication.status).toBe(applicationData.status)
    expect(savedApplication.visibility_status).toBe(applicationData.visibility_status)
  })
})