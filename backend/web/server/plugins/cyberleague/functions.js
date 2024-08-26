const {
  declareEnumField,
  declareVirtualField,
  setPreprocessGet,
  setPreCreateData,
  declareComputedField,
  setPrePutData,
  getModel,
  setPostCreateData,
} = require('../../utils/database')
const { ROLES, SECTOR, CATEGORIES, CONTENT_TYPE, JOBS, COMPANY_SIZE, ESTIMATED_DURATION_UNITS } = require('./consts')
const { PURCHASE_STATUS } = require('../../../utils/consts')
const Post = require('../../models/Post')
const Company = require('../../models/Company')
const { BadRequestError } = require('../../utils/errors')
const { getterPinnedFn } = require('../../utils/pinned')

//User declarations
const USER_MODELS = ['user', 'loggedUser', 'admin', 'partner', 'member']
USER_MODELS.forEach(m => {
  declareEnumField({ model: m, field: 'job', enumValues: JOBS })
  declareVirtualField({ model: m, field: 'password2', instance: 'String' })
  declareVirtualField({ model: m, field: 'fullname', instance: 'String', requires:'firstname,lastname'})
  declareVirtualField({ model: m, field: 'shortname', instance: 'String',requires:'firstname,lastname'})
  declareVirtualField({ model: m, field: 'is_admin', instance: 'Boolean',requires:'role'})
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
  declareVirtualField({
    model: m, field: 'pinned_users_count', instance: 'number', multiple: false,
    caster: {
      instance: 'ObjectID',
      options: { ref: 'user' }
    },
  })
  declareVirtualField({
    model: m, field: 'pinned_companies_count', instance: 'number', multiple: false,
    caster: {
      instance: 'ObjectID',
      options: { ref: 'company' }
    },
  })
  declareComputedField({model: m, field: 'pinned', getterFn: getterPinnedFn('company', 'pinned_by'), requires:'pinned_by'})
  declareEnumField({ model: m, field: 'role', enumValues: ROLES })
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
declareVirtualField({
  model: 'company', field: 'pinned_by_count', instance: 'number', multiple: false,
  caster: {
    instance: 'ObjectID',
    options: { ref: 'user' }
  },
})
declareEnumField( {model: 'purchase', field: 'status', enumValues: PURCHASE_STATUS})
declareEnumField( {model: 'company', field: 'sector', enumValues: SECTOR})
declareEnumField( {model: 'company', field: 'size', enumValues: COMPANY_SIZE})
declareComputedField({model: 'company', field: 'pinned', getterFn: getterPinnedFn('company', 'pinned_by'), requires:'pinned_by'})

//Expertise declarations
declareEnumField( {model: 'expertise', field: 'category', enumValues: CATEGORIES})

//Content declarations
declareEnumField( {model: 'content', field: 'type', enumValues: CONTENT_TYPE})
declareVirtualField({model: 'content', field: 'comments', instance: 'Array', multiple: true, 
  caster: {
    instance: 'ObjectID',
    options: { ref: 'comment' }
  },})
declareVirtualField({model: 'content', field: 'comments_count', instance: 'number'})

//Post declarations
declareVirtualField({model: 'post', field: 'comments_count', instance: 'number'})
declareVirtualField({model: 'post', field: 'likes_count', ROLE: 'number' })
declareVirtualField({model: 'post', field: 'comments', instance: 'Array', multiple: true, 
  caster: {
    instance: 'ObjectID',
    options: { ref: 'comment' }
  },})
declareComputedField({model: 'post', field: 'liked', getterFn: getterPinnedFn('post', '_liked_by'), requires:'_liked_by'})

// Enums Mission Schema
declareEnumField({model: 'mission', field: 'estimation_duration_unit', enumValues: ESTIMATED_DURATION_UNITS})

const preprocessGet = async ({model, fields, id, user, params}) => {
  if (model=='loggedUser') {
    model='user'
    id = user?._id || 'INVALIDID'
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
  return Promise.resolve({model, params})
}

setPreCreateData(preCreate)

const postCreate = async ({ model, params, data, user }) => {
  if (model == `customerSuccess`) {
    await Company.findByIdAndUpdate(params.parent, {$push: {customer_successes: data._id}})
  }
  if (model == `certification`) {
    await Company.findByIdAndUpdate(params.parent, {$push: {certifications: data._id}})
  }
  return data
}

setPostCreateData(postCreate)

const prePutData = async ({model, id, params, user}) => {
  if (model==`post`){
    if(`liked` in params){
      await Post.updateOne(
        {_id:id},
        {
          ...params.liked ? {$addToSet: {_liked_by: user._id}}
          : {$pull: {_liked_by: user._id}}
        }
      )
    }
  }
  if (model==`company` || model == `user`){
    if(`pinned` in params){

      await Post.updateOne(
        {_id:id},
        {
          ...params.pinned ? {$addToSet: {pinned_by: user._id}}
          : {$pull: {pinned_by: user._id}}
        }
      )}
  }
  return {model, id, params, user}
}

setPrePutData(prePutData)