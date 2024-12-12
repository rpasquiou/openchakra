const mongoose = require('mongoose')
const moment = require('moment')
const lodash = require('lodash')
const { MONGOOSE_OPTIONS, loadFromDb } = require('../../server/utils/database')
require('../../server/plugins/aftral-lms/functions')
const {BaseBuilder, BaseResource, BaseSequence, BaseModule, BaseProgram, BaseSession, BaseTrainee}=require('./baseData')
const User = require('../../server/models/User')
const Resource = require('../../server/models/Resource')
const Session = require('../../server/models/Session')
const Sequence = require('../../server/models/Sequence')
const Module = require('../../server/models/Module')
const Program = require('../../server/models/Program')
const { BLOCK_STATUS_FINISHED } = require('../../server/plugins/aftral-lms/consts')
const Progress = require('../../server/models/Progress')
const { lockSession, getBlockStatus, onBlockFinished } = require('../../server/plugins/aftral-lms/block')
const { getBlockChildren } = require('../../server/plugins/aftral-lms/resources')
const Block = require('../../server/models/Block')
const {getFirstAvailableResource}=require('./utils')

jest.setTimeout(600000)

describe('Test trainee session progress', () => {

  let creator, trainee

  beforeAll(async() => {
    await mongoose.connect(`mongodb://localhost/test${moment().unix()}`, MONGOOSE_OPTIONS)
    creator=await User.create({...BaseBuilder})
    trainee=await User.create({...BaseTrainee})
  })

  afterAll(async() => {
    await mongoose.connection.dropDatabase()
    await mongoose.connection.close()
  })

  const createBlock = async (creator, trainee, order, count, parent, type=Session) => {
    let block
    const typeName=type.modelName
    const name=parent  ? parent.name+order : order || 1
    console.log('Create', typeName)
    if ([Session, Program].includes(type)) {
      console.log('in program/session')
      block=await type.create({
        creator,
        name, 
        start_date: moment().add(-1, 'month'),
        end_date: moment().add(1, 'month'),
        code: 'OUPS',
        trainees:[trainee],
        parent,
        order:1,
      })
    }
    else {
      block=await type.create({ ...BaseResource, creator, name, parent, order, code: name, closed: type==Sequence})
    }
    const nextType=type==Session ? Program : type==Program ? Module : type==Module ? Sequence : type==Sequence ? Resource: null
    if (nextType) {
      for (const i in lodash.range(1, count+1)) {
        await createBlock(creator, trainee, i, count, block, nextType)
      }
    }
    return block
  }

  const displayStatus = async (sessionId, traineeId) => {
    let children=await getBlockChildren({blockId: sessionId})
    children=await Promise.all(children.map(c => Block.findById(c._id)))
    let status=await Promise.all(children.map(child => getBlockStatus(traineeId, null, {_id: child._id})))
    let zipped=lodash.zip(children.map(c => c.name), status)
    zipped=lodash.sortBy(zipped, z => z[0])
    console.log(zipped)
  }

  it('must load proper sequence', async() => {
    console.log(trainee)
    const session=await createBlock(creator, trainee, 1, 2)
    await lockSession(session._id)
    await displayStatus(session._id, trainee._id)
    let nextResource=await getFirstAvailableResource(session._id, trainee._id)
    await onBlockFinished(trainee, nextResource)
    nextResource=await getFirstAvailableResource(session._id, trainee._id)
    await onBlockFinished(trainee, nextResource)
    nextResource=await getFirstAvailableResource(session._id, trainee._id)
    await onBlockFinished(trainee, nextResource)
    nextResource=await getFirstAvailableResource(session._id, trainee._id)
    await onBlockFinished(trainee, nextResource)
    nextResource=await getFirstAvailableResource(session._id, trainee._id)
    await onBlockFinished(trainee, nextResource)
    nextResource=await getFirstAvailableResource(session._id, trainee._id)
    await displayStatus(session._id, trainee._id)
  })


})
