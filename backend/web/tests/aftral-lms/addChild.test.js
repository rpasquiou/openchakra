const moment=require('moment')
const mongoose = require('mongoose')
const {MONGOOSE_OPTIONS, loadFromDb} = require('../../server/utils/database')
require('../../server/plugins/aftral-lms/functions')
const User=require('../../server/models/User')
const { ROLE_CONCEPTEUR, RESOURCE_TYPE_LINK, ACHIEVEMENT_RULE_CONSULT} = require('../../server/plugins/aftral-lms/consts')
const Resource=require('../../server/models/Resource')
const Module = require('../../server/models/Module')
const Sequence = require('../../server/models/Sequence')
const { addChildAction } = require('../../server/plugins/aftral-lms/actions')

jest.setTimeout(60*1000)

describe('Test models computations', () => {

  let designer, resource, module, sequence

  beforeAll(async() => {
    await mongoose.connect(`mongodb://localhost/test${moment().unix()}`, MONGOOSE_OPTIONS)
    designer=await User.create({firstname: 'concepteur', lastname: 'concepteur', 
      email: 'hello+concepteur@wappizy.com', role: ROLE_CONCEPTEUR, password: 'p1'})
    module=await Module.create({name: 'Module', creator: designer})
    sequence=await Sequence.create({name: 'Séquence', creator: designer})
    resource=await Resource.create({
      name: 'Ressource', resource_type: RESOURCE_TYPE_LINK, achievement_rule: ACHIEVEMENT_RULE_CONSULT, 
        creator: designer, url: 'https://www.google.com',
    })
  })

  afterAll(async() => {
    await mongoose.connection.dropDatabase()
    await mongoose.connection.close()
  })

  it('must add children', async() => {
    const getModuleResourcesCount = async () => {
      const mod=await Module.findOne().populate({path: 'children', populate: 'children'})
      return mod.children[0]?.children?.length || 0
    }
    const getSequenceResourcesCount = async () => {
      const seq=await Sequence.findOne().populate('children')
      return seq.children?.length || 0
    }
    
    expect(await getSequenceResourcesCount()).toEqual(0)
    expect(await getModuleResourcesCount()).toEqual(0)
    await addChildAction({parent: sequence._id, child: resource._id}, designer)
    expect(await getSequenceResourcesCount()).toEqual(1)

    await addChildAction({parent: module._id, child: sequence._id}, designer)
    expect(await getModuleResourcesCount()).toEqual(1)

    // Add a resource to the sequence : the module must now have 2 resources
    await addChildAction({parent: sequence._id, child: resource._id}, designer)
    expect(await getSequenceResourcesCount()).toEqual(2)
    expect(await getModuleResourcesCount()).toEqual(2)
    // Add again a resource to the sequence : the module must now have 2 resources
    await addChildAction({parent: sequence._id, child: resource._id}, designer)
    expect(await getSequenceResourcesCount()).toEqual(3)
    expect(await getModuleResourcesCount()).toEqual(3)
  })

})
