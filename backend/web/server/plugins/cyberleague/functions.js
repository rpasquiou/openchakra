const mongoose = require('mongoose')
const lodash = require('lodash')
const {
  declareEnumField,
  declareVirtualField,
  setPreprocessGet,
  setPreCreateData,
  declareComputedField,
  getModel,
  setPostCreateData,
  setPostPutData,
  idEqual,
} = require('../../utils/database')
const { ROLES, SECTOR, CATEGORIES, CONTENT_TYPE, JOBS, COMPANY_SIZE, ROLE_PARTNER, ROLE_ADMIN, ROLE_MEMBER, ESTIMATED_DURATION_UNITS } = require('./consts')
const { PURCHASE_STATUS } = require('../../../utils/consts')
const Company = require('../../models/Company')
const { BadRequestError } = require('../../utils/errors')
const { getterPinnedFn, setterPinnedFn } = require('../../utils/pinned')
const Group = require('../../models/Group')
const { getterCountFn } = require('./count')

//User declarations
const USER_MODELS = ['user', 'loggedUser', 'admin', 'partner', 'member']
USER_MODELS.forEach(m => {
  declareEnumField({ model: m, field: 'job', enumValues: JOBS })
  declareVirtualField({ model: m, field: 'password2', instance: 'String' })
  declareVirtualField({ model: m, field: 'fullname', instance: 'String', requires:'firstname,lastname'})
  declareVirtualField({ model: m, field: 'shortname', instance: 'String',requires:'firstname,lastname'})
  declareVirtualField({ model: m, field: 'pinned_by_count', instance: 'Number' })
  declareVirtualField({
    model: m, field: 'pinned_users', instance: 'Array', multiple: true,
    caster: {
      instance: 'ObjectID',
      options: { ref: 'user' }
    },
  })
  declareVirtualField({
    model: m, field: 'pinned_companies', instance: 'Array', multiple: true,
    caster: {
      instance: 'ObjectID',
      options: { ref: 'company' }
    },
  })
  declareVirtualField({model: m, field: 'pinned_users_count', instance: 'Number'})
  declareVirtualField({model: m, field: 'pinned_companies_count', instance: 'Number'})
  declareComputedField({model: m, field: 'pinned', getterFn: getterPinnedFn(m, 'pinned_by'), setterFn: setterPinnedFn(m, 'pinned_by'), requires:'pinned_by'})
  declareEnumField({ model: m, field: 'role', enumValues: ROLES })
  declareVirtualField({
    model: m, field: 'groups', instance: 'Array', multiple: true,
    caster: {
      instance: 'ObjectID',
      options: { ref: 'group' }
    },
  })
  declareVirtualField({
    model: m, field: 'pending_groups', instance: 'Array', multiple: true,
    caster: {
      instance: 'ObjectID',
      options: { ref: 'group' }
    },
  })
  declareVirtualField({model: m, field: 'groups_count', instance: 'Number'})
  declareVirtualField({model: m, field: 'pending_groups_count', instance: 'Number'})
  declareComputedField({model: m, field: 'partner_count', getterFn: getterCountFn('user', {'role': ROLE_PARTNER})})
  declareComputedField({model: m, field: 'member_count', getterFn: getterCountFn('user', {'role': ROLE_MEMBER})})
  declareComputedField({model: m, field: 'user_count', getterFn: getterCountFn('user')})
  declareVirtualField({model: m, field: 'communications', instance: 'Array', multiple: true,
    caster: {
      instance: 'ObjectID',
      options: { ref: 'communication' }
    },
  })
  declareVirtualField({model: m, field: 'experiences', instance: 'Array', multiple: true,
    caster: {
      instance: 'ObjectID',
      options: { ref: 'experience' }
    },
  })
  declareVirtualField({model: m, field: 'trainings', instance: 'Array', multiple: true,
    caster: {
      instance: 'ObjectID',
      options: { ref: 'training' }
    },
  })
  declareVirtualField({model: m, field: 'is_company_admin', requires: 'company.administrators', instance: 'Boolean'})
})

//Company declarations
declareVirtualField({
  model: 'company', field: 'users', instance: 'Array', multiple: true,
  caster: {
    instance: 'ObjectID',
    options: { ref: 'user' }
  },
})
declareVirtualField({
  model: 'company', field: 'pinned_by', instance: 'Array', multiple: true,
  caster: {
    instance: 'ObjectID',
    options: { ref: 'user' }
  },
})
declareVirtualField({model: 'company', field: 'pinned_by_count', instance: 'Number'})
declareVirtualField({ model: 'company', field: 'missions', instance: 'Array', multiple: true,
  caster: {
    instance: 'ObjectID',
    options: { ref: 'mission' }
  },
})
declareVirtualField({ model: 'company', field: 'company_events', instance: 'Array', multiple: true,
  caster: {
    instance: 'ObjectID',
    options: { ref: 'event' }
  },
})
declareVirtualField({ model: 'company', field: 'company_contents', instance: 'Array', multiple: true,
  caster: {
    instance: 'ObjectID',
    options: { ref: 'content' }
  },
})
declareEnumField( {model: 'company', field: 'sector', enumValues: SECTOR})
declareEnumField( {model: 'company', field: 'size', enumValues: COMPANY_SIZE})
declareEnumField( {model: 'company', field: 'targeted_markets', enumValues: SECTOR})
declareComputedField({model: 'company', field: 'pinned', getterFn: getterPinnedFn('company', 'pinned_by'), setterFn: setterPinnedFn('company', 'pinned_by'), requires:'pinned_by'})

//Expertise declarations
declareEnumField( {model: 'expertise', field: 'category', enumValues: CATEGORIES})

//Content declarations
declareEnumField( {model: 'content', field: 'type', enumValues: CONTENT_TYPE})
declareVirtualField({model: 'content', field: 'comments', instance: 'Array', multiple: true, 
  caster: {
    instance: 'ObjectID',
    options: { ref: 'comment' }
  },})
declareVirtualField({model: 'content', field: 'comments_count', instance: 'Number'})
declareVirtualField({model: 'content', field: 'likes_count', instance: 'Number' })
declareComputedField({model: 'content', field: 'liked', getterFn: getterPinnedFn('content', '_liked_by'), setterFn: setterPinnedFn('content', '_liked_by'), requires:'_liked_by'})

//Post declarations
declareVirtualField({model: 'post', field: 'comments_count', instance: 'Number'})
declareVirtualField({model: 'post', field: 'likes_count', ROLE: 'number' })
declareVirtualField({model: 'post', field: 'comments', instance: 'Array', multiple: true, 
  caster: {
    instance: 'ObjectID',
    options: { ref: 'comment' }
  },})
declareComputedField({model: 'post', field: 'liked', getterFn: getterPinnedFn('post', '_liked_by'), setterFn: setterPinnedFn('post', '_liked_by'), requires:'_liked_by'})

//Group declarations
declareVirtualField({model: 'group', field: 'posts', instance: 'Array', multiple: true, 
  caster: {
    instance: 'ObjectID',
    options: { ref: 'post' }
  },})
declareVirtualField({model: 'group', field: 'posts_count', instance: 'Number'})
declareVirtualField({model: 'group', field: 'pending_users_count', instance: 'Number'})
declareVirtualField({model: 'group', field: 'users_count', instance: 'Number'})

//Partner declarations

// Enums Mission Schema
declareEnumField({model: 'mission', field: 'estimation_duration_unit', enumValues: ESTIMATED_DURATION_UNITS})

//Pack && purchase status declarations
declareEnumField( {model: 'purchase', field: 'status', enumValues: PURCHASE_STATUS})


const preprocessGet = async ({model, fields, id, user, params}) => {
  if (model=='loggedUser') {
    model='user'
    id = user?._id || 'INVALIDID'
  }
  //if id is defined it is a get for a group, else it is for homepage posts
  if (model==`post`) {
    if (!id) {
      params['filter.group'] = null
    } else {
      params.filter = {group: id}
    }
  }
  return Promise.resolve({model, fields, id, user, params})
}

setPreprocessGet(preprocessGet)

const preCreate = async ({model, params, user}) => {
  params.creator = params.creator || user._id
  if(model == `comment`) {
    if (!params.parent) {
      throw new BadRequestError(`Le parent est obligatoire`)
    }
    const model = await getModel(params.parent, [`post`,`content`])
    if (model == `post`) {
      params.post = params.parent
    }
    else {
      params.content = params.parent
    }
  }
  if (model == `group`) {
    if (user.role != ROLE_PARTNER) {
      if (user.role != ROLE_ADMIN) {
        throw new BadRequestError(`Seul un admin ou un partner peut créer une sous-ligue`)
      }
    } else {
      const company =await Company.findById(user.company);
      if (!lodash.some(company.administrators, (id) => idEqual(id, user._id) )) {
        throw new BadRequestError(`Il faut être admin de son entreprise pour créer une sous-ligue`)
      }
    }
    params.admin = user._id
    params.users = [user._id]
  }
  if (model== `company`) {
    if (params.is_partner===undefined) { params.is_partner = user.role==ROLE_ADMIN}
  }

  if(model === 'post') {
    if (params.parent) {
      const parentModel = await getModel(params.parent, ['group']);
      if (parentModel === 'group') {
        params.group = params.parent;
      } else {
        throw new BadRequestError(`Le parent doit être un groupe`);
      }
    } else {
      params.group = null;
    }
  } 

  return Promise.resolve({model, params})
}

setPreCreateData(preCreate)

const postCreate = async ({ model, params, data, user }) => {
  if (model == `customerSuccess`) {
    await Company.findByIdAndUpdate(params.parent, {$push: {customer_successes: data._id}})
  }
  if (model == `certification`) {
    const model = await getModel(params.parent, [`company`,`user`])
    await mongoose.models[model].findByIdAndUpdate(params.parent, {$push: {certifications: data._id}})
  }
  return data
}

setPostCreateData(postCreate)

const postPutData = async ({model, id, params, user}) => {
  if (model == `group`) {
    if (`users` in params) {
      await Group.updateOne({_id:id}, {$pull: {pending_users: params.users}})
    }
  }
  return {model, id, params, user}
}

setPostPutData(postPutData)