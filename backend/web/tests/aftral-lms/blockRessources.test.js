const mongoose = require('mongoose')
const moment = require('moment')
const { MONGOOSE_OPTIONS, loadFromDb, idEqual } = require('../../server/utils/database')
const Module = require('../../server/models/Module')
const Chapter = require('../../server/models/Chapter')
const {BaseModule, BaseTrainee, BaseResource, BaseSequence} = require('./baseData')
const User = require('../../server/models/User')
const { ROLE_APPRENANT } = require('../../server/plugins/aftral-lms/consts')
const Sequence = require('../../server/models/Sequence')
const Resource = require('../../server/models/Resource')
const Block = require('../../server/models/Block')
const {getBlockResources}=require('../../server/plugins/aftral-lms/resources')
jest.setTimeout(60000)

describe('Block resources', () => {
  beforeAll(async () => {
    await mongoose.connect(`mongodb://localhost/test`, MONGOOSE_OPTIONS)
  })

  afterAll(async () => {
    // await mongoose.connection.dropDatabase()
    await mongoose.connection.close()
  })

  it('must return block resources in correct order', async()=> {
    let chapter=await Chapter.findOne()
    let user=await User.findOne()
    if (!chapter) {
      console.log('Nedd to create')
      const NB=6
      user=await User.create({...BaseTrainee, role: ROLE_APPRENANT, password: 'hop'})
      chapter=await Chapter.create({name: 'Chapitre', creator: user})
      for (let i=0; i<NB; i++) {
        const mod=await Module.create({...BaseModule, creator: user,name: `Module ${i+1}`, parent: chapter, order:i+1})
        for (let j=0; j<NB; j++) {
          const seq=await Sequence.create({...BaseSequence, creator: user,name: `Sequence ${i+1} ${j+1}`, parent: mod, order:j+1})
          for (let k=0; k<NB; k++) {
            const name=`Ressource ${i+1} ${j+1} ${k+1}`
            const mod=await Resource.create({...BaseResource, creator: user,name, parent: seq, order: k+1, code: name})
          }
        }
      }
      await Block.ensureIndexes()
    }
    console.time('Get block resources')
    const resources=await getBlockResources({blockId: chapter._id, userId: user._id, allResources: true})
    console.timeEnd('Get block resources')
    const display=await Promise.all(resources.map(async r => {
      const res=await Resource.findById(r)
      return `${res.name}`
    }))
    console.log(display.join('\n'))
  })
})