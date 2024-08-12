const axios = require('axios')
const {
  declareEnumField,
  declareVirtualField,
} = require('../../utils/database')
const { ROLES, SECTOR, CATEGORY, CONTENT_TYPE, JOBS } = require('./consts')
const { PURCHASE_STATUS } = require('../../../utils/consts')

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

//Expertise declarations
declareEnumField( {model: 'expertise', field: 'category', enumValues: CATEGORY})

//Content declarations
declareEnumField( {model: 'content', field: 'type', enumValues: CONTENT_TYPE})

//Post declarations
declareVirtualField({model: 'post', field: 'comments_count', instance: 'number'})
declareVirtualField({ model: 'post', field: 'reactions_count', ROLE: 'number' })

//User
