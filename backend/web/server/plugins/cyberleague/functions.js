const axios = require('axios')
const {
  declareEnumField,
  declareVirtualField,
  setPreprocessGet,
  setPreCreateData,
  declareComputedField,
  setPrePutData,
} = require('../../utils/database')
const { ROLES, SECTOR, CATEGORY, CONTENT_TYPE, JOBS, COMPANY_SIZE } = require('./consts')
const { PURCHASE_STATUS } = require('../../../utils/consts')
const { getLiked } = require('./post')
const Post = require('../../models/Post')

//User declarations
const USER_MODELS = ['user', 'loggedUser', 'admin', 'partner', 'member']
USER_MODELS.forEach(m => {
  declareEnumField({ model: m, field: 'job', enumValues: JOBS })
  declareVirtualField({ model: m, field: 'password2', instance: 'String' })
  declareVirtualField({ model: m, field: 'fullname', instance: 'String', requires:'firstname,lastname'})
  declareVirtualField({ model: m, field: 'shortname', instance: 'String',requires:'firstname,lastname'})
  declareVirtualField({ model: m, field: 'followers_count', instance: 'Number' })
  declareVirtualField({
    model: m, field: 'users_following', instance: 'Array', multiple: true,
    caster: {
      instance: 'ObjectID',
      options: { ref: 'user' }
    },
  })
  declareVirtualField({
    model: m, field: 'companies_following', instance: 'Array', multiple: true,
    caster: {
      instance: 'ObjectID',
      options: { ref: 'company' }
    },
  })
  declareVirtualField({
    model: m, field: 'users_following_count', instance: 'number', multiple: false,
    caster: {
      instance: 'ObjectID',
      options: { ref: 'user' }
    },
  })
  declareVirtualField({
    model: m, field: 'companies_following_count', instance: 'number', multiple: false,
    caster: {
      instance: 'ObjectID',
      options: { ref: 'company' }
    },
  })
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
  model: 'company', field: 'followers', instance: 'Array', multiple: true,
  caster: {
    instance: 'ObjectID',
    options: { ref: 'user' }
  },
})
declareVirtualField({
  model: 'company', field: 'followers_count', instance: 'number', multiple: false,
  caster: {
    instance: 'ObjectID',
    options: { ref: 'user' }
  },
})
declareEnumField( {model: 'purchase', field: 'status', enumValues: PURCHASE_STATUS})
declareEnumField( {model: 'company', field: 'sector', enumValues: SECTOR})
declareEnumField( {model: 'company', field: 'size', enumValues: COMPANY_SIZE})

//Expertise declarations
declareEnumField( {model: 'expertise', field: 'category', enumValues: CATEGORY})

//Content declarations
declareEnumField( {model: 'content', field: 'type', enumValues: CONTENT_TYPE})

//Post declarations
declareVirtualField({model: 'post', field: 'comments_count', instance: 'number'})
declareVirtualField({ model: 'post', field: 'likes_count', ROLE: 'number' })
declareComputedField({model: 'post', field: 'liked', getterFn: getLiked, requires:'likes'})

//User

const preprocessGet = async ({model, fields, id, user, params}) => {
  if (model=='loggedUser') {
    model='user'
    id = user?._id || 'INVALIDID'
  }
  return Promise.resolve({model, fields, id, user, params})
}

setPreprocessGet(preprocessGet)

const preCreate = async ({model, params, user}) => {
  if(model == 'post') {
    params.creator = params.creator || user._id
  }
  return Promise.resolve({model, params})
}

setPreCreateData(preCreate)

const prePutData = async ({model, id, params, user}) => {
  if (model=='post'){
    if('liked' in params){

      await Post.updateOne(
        {_id:id},
        {
          ...params.liked ? {$addToSet: {_likes: user._id}}
          : {$pull: {_likes: user._id}}
        }
      )}
  }
  return {model, id, params, user}
}

setPrePutData(prePutData)