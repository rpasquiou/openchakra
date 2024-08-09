const mongoose = require('mongoose')
const { MONGOOSE_OPTIONS, loadFromDb } = require('../../server/utils/database')
require('../../server/plugins/aftral-lms/functions')
const User = require('../../server/models/User')
const Resource = require('../../server/models/Resource')
const Sequence = require('../../server/models/Sequence')
const Module = require('../../server/models/Module')
const Program = require('../../server/models/Program')
const Session = require('../../server/models/Session')
const { ROLE_APPRENANT, ROLE_FORMATEUR, RESOURCE_TYPE_PDF, ACHIEVEMENT_RULE_CHECK, ACHIEVEMENT_RULE_SUCCESS, ACHIEVEMENT_RULE_CONSULT, RESOURCE_TYPE_VIDEO, ACHIEVEMENT_RULE_DOWNLOAD, ROLE_CONCEPTEUR } = require('../../server/plugins/aftral-lms/consts')
const ProductCode = require('../../server/models/ProductCode')
const { addChildAction } = require('../../server/plugins/aftral-lms/actions')
const { getBlockResources } = require('../../server/plugins/aftral-lms/resources')
const Block = require('../../server/models/Block')

jest.setTimeout(60000)

describe('User', () => {
  let conceptor, trainee, trainer, session, program, productCode, modulee1, modulee2, sequence1, sequence2, sequence3, resource1, resource2, resource3, resource4
  beforeAll(async () => {
    await mongoose.connect(`mongodb://localhost/aftral-test`, MONGOOSE_OPTIONS)

    trainee = await User.create({
      role: ROLE_APPRENANT,
      email: `a@a.com`,
      password: `Je déteste Python`,
      firstname: `John`,
      lastname: `Doe`,
    })

    trainer = await User.create({
      role: ROLE_FORMATEUR,
      email: `b@b.com`,
      password: `J'enseigne le Python`,
      firstname: `Jeanette`,
      lastname: `Doe`,
    })

    conceptor = await User.create({
      role: ROLE_CONCEPTEUR,
      email: `c@c.com`,
      password: `J'impose le Python`,
      firstname: `Jack`,
      lastname: `Doe`,
    })

    session = await Block.create({
      type: 'session',
      name: `Test session`,
      creator: trainer._id,
      start_date: new Date(),
      end_date: new Date('2025-07-07'),
      trainees:[trainee._id]
    })

    productCode = await ProductCode.create({code: 'Product Code Test'})    

    program = await Block.create({
      type: 'program',
      codes:[productCode.id],
      name: `Test program`,
      creator: trainer._id
    })

    modulee1 = await Block.create({
      type: 'module',
      name: `Test Module 1`,
      creator: trainer._id
    })

    modulee2 = await Block.create({
      type: 'module',
      name: `Test Module 2`,
      creator: trainer._id
    })

    sequence1 = await Block.create({
      type: 'sequence',
      name: `Test Sequence 1`,
      creator: trainer._id
    })

    sequence2 = await Block.create({
      type: 'sequence',
      name: `Test Sequence 2`,
      creator: trainer._id
    })

    sequence3 = await Block.create({
      type: 'sequence',
      name: `Test Sequence 3`,
      creator: trainer._id
    })

    resource1 = await Block.create({
      type: 'resource',
      name: `Test Resource 1`,
      resource_type: RESOURCE_TYPE_VIDEO,
      creator: trainer._id,
      url: `hi.pdf`,
      achievement_rule: ACHIEVEMENT_RULE_DOWNLOAD
    })

    resource2 = await Block.create({
      type: 'resource',
      name: `Test Resource 2`,
      resource_type: RESOURCE_TYPE_VIDEO,
      creator: trainer._id,
      url: `hi.pdf`,
      achievement_rule: ACHIEVEMENT_RULE_DOWNLOAD
    })

    resource3 = await Block.create({
      type: 'resource',
      name: `Test Resource 3`,
      resource_type: RESOURCE_TYPE_VIDEO,
      creator: trainer._id,
      url: `hi.pdf`,
      achievement_rule: ACHIEVEMENT_RULE_DOWNLOAD
    })

    resource4 = await Block.create({
      type: 'resource',
      name: `Test Resource 4`,
      resource_type: RESOURCE_TYPE_VIDEO,
      creator: trainer._id,
      url: `hi.pdf`,
      achievement_rule: ACHIEVEMENT_RULE_DOWNLOAD
    })

    await addChildAction({parent: session._id, child: program._id}, conceptor)
    await addChildAction({parent: program._id, child: modulee1._id}, conceptor)
    await addChildAction({parent: program._id, child: modulee2._id}, conceptor)
    await addChildAction({parent: modulee1._id, child: sequence1._id}, conceptor)
    await addChildAction({parent: modulee1._id, child: sequence2._id}, conceptor)
    await addChildAction({parent: modulee2._id, child: sequence3._id}, conceptor)
    await addChildAction({parent: sequence1._id, child: resource1._id}, conceptor)
    await addChildAction({parent: sequence1._id, child: resource2._id}, conceptor)
    await addChildAction({parent: sequence2._id, child: resource3._id}, conceptor)
    await addChildAction({parent: sequence3._id, child: resource4._id}, conceptor)

    await session.save()
    await program.save()
    await program.save()
    await modulee1.save()
    await modulee2.save()
    await sequence1.save()
    await sequence2.save()
    await sequence3.save()
  })

  afterAll(async () => {
    await mongoose.connection.dropDatabase()
    await mongoose.connection.close()
  })

  it(`it must user's resources`, async () => {
    const [u] = await loadFromDb({model:'user', fields:['resources'], id:trainee._id})
    expect(u.resources.length).toEqual(4)
  })
})