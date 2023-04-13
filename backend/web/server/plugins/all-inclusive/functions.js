const {
  AVAILABILITY,
  COACHING,
  COMPANY_STATUS,
  EXPERIENCE,
  ROLES
} = require('./consts')
const {
  declareEnumField,
  declareVirtualField,
  setPreCreateData,
  setPreprocessGet,
  setFilterDataUser,
} = require('../../utils/database')

const preprocessGet = ({model, fields, id, user}) => {
  if (model=='loggedUser') {
    model='user'
    id = user?._id || 'INVALIDID'
  }

  return Promise.resolve({model, fields, id})

}

setPreprocessGet(preprocessGet)

const USER_MODELS=['user', 'loggedUser']
USER_MODELS.forEach(m => {
  declareVirtualField({model: m, field: 'full_name', instance: 'String', requires: 'firstname,lastname'})
  declareEnumField({model: m, field: 'role', enumValues: ROLES})
  declareVirtualField({model: m, field: 'profile_progress', instance: 'Number', requires: 'company'})
  declareEnumField({model: m, field: 'coaching', enumValues: COACHING})
  declareVirtualField({model: m, field: 'password2', instance: 'String'})
  declareEnumField({model: m, field: 'availability', enumValues: AVAILABILITY})
  declareVirtualField({model: m, field: 'comments', instance: 'Array', requires: '', multiple: true,
    caster: {
      instance: 'ObjectID',
      options: {ref: 'comment'}}
  })
  declareVirtualField({model: m, field: 'recommandations', instance: 'Array', requires: '', multiple: true,
    caster: {
      instance: 'ObjectID',
      options: {ref: 'recommandation'}}
  })
  declareVirtualField({model: m, field: 'quotations', instance: 'Array', requires: '', multiple: true,
    caster: {
      instance: 'ObjectID',
      options: {ref: 'quotation'}}
  })
})

declareEnumField({model: 'company', field: 'status', enumValues: COMPANY_STATUS})
declareEnumField({model: 'jobUser', field: 'experience', enumValues: EXPERIENCE})
