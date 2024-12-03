const mongoose = require('mongoose')
const { jest, describe, it, expect, afterEach, beforeEach } = require('@jest/globals')
const {
  BOOLEAN_YES,
  MISSION_FREQUENCY_MONTHLY,
  MISSION_STATUS_ASKING_ALLE,
} = require('../../server/plugins/all-inclusive/consts')
const MissionSchema = require('../../server/plugins/all-inclusive/schemas/MissionSchema')
const { clone } = require('../../server/plugins/all-inclusive/mission')

describe('Mission clone', () => {
  let connection
  let Mission
  let originalMission

  beforeAll(async () => {
    connection = await mongoose.connect('mongodb://localhost:27017/testdb', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    })
    Mission = mongoose.model('mission', MissionSchema)
  })

  beforeEach(async () => {
    originalMission = {
      name: 'Mission Test',
      description: 'Description Test',
      duration: '1 mois',
      address: 'Adresse Test',
      required_services: 'Service Test',
      document: 'Document Test',
      document_2: 'Document Test 2',
      document_3: 'Document Test 3',
      customer_location: true,
      foreign_location: false,
      recurrent: BOOLEAN_YES,
      frequency: MISSION_FREQUENCY_MONTHLY,
      user: new mongoose.Types.ObjectId(),
      dummy: 0,
    }
  })
  
  afterEach(async () => {
    await Mission.deleteMany({})
  })
  
  afterAll(async () => {
    await mongoose.connection.db.dropDatabase()
    await mongoose.connection.close()
  })


  it('should clone a mission with all specified fields', async () => {
    const mission = await Mission.create(originalMission)
    
    const clonedMission = await clone(mission._id)

    expect(clonedMission).toBeTruthy()
    expect(clonedMission.name).toBe(`Copie de ${originalMission.name}`)
    expect(clonedMission.description).toBe(originalMission.description)
    expect(clonedMission.duration).toBe(originalMission.duration)
    expect(clonedMission.address).toBe(originalMission.address)
    expect(clonedMission.required_services).toBe(originalMission.required_services)
    expect(clonedMission.document).toBe(originalMission.document)
    expect(clonedMission.document_2).toBe(originalMission.document_2)
    expect(clonedMission.document_3).toBe(originalMission.document_3)
    expect(clonedMission.customer_location).toBe(originalMission.customer_location)
    expect(clonedMission.foreign_location).toBe(originalMission.foreign_location)
    expect(clonedMission.recurrent).toBe(originalMission.recurrent)
    expect(clonedMission.frequency).toBe(originalMission.frequency)
    expect(clonedMission.user.toString()).toBe(originalMission.user.toString())
    expect(clonedMission.dummy).toBe(originalMission.dummy)
    expect(clonedMission.status).toBe(MISSION_STATUS_ASKING_ALLE)
    expect(clonedMission._id).not.toEqual(mission._id)
  })
})
