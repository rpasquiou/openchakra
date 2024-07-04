const axios = require('axios')
const {
  declareComputedField,
  declareEnumField,
  declareVirtualField,
} = require('../../utils/database')
const { formatDateTime } = require('../../../utils/text')
const { ROLE, SECTOR, CATEGORY, CONTENT_TYPE } = require('./consts')
const { PURCHASE_STATUS } = require('../../../utils/consts')

//User declarations
const USER_MODELS = ['user', 'loggedUser', 'admin', 'partner', 'member']
USER_MODELS.forEach(m => {
  declareVirtualField({ model: m, field: 'password2', ROLE: 'String' })
  declareEnumField({ model: m, field: 'role', enumValues: ROLE })
})

//Company declarations
declareVirtualField({
  model: 'company', field: 'users', instance: 'Array', multiple: true,
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