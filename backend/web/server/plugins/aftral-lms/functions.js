const {
  declareVirtualField,
} = require('../../utils/database')
const { RESOURCE_TYPE, PROGRAM_STATUS, ROLES } = require('./consts')

const MODELS=['block', 'program', 'module', 'sequence', 'resource']

MODELS.forEach(model => {
  declareVirtualField({model, field: 'duration', instance: 'Number'})
  declareVirtualField({model, field: 'order', instance: 'Number'})
})
declareVirtualField({model:'resource', field: 'resourceType', instance: 'String', enumValues: RESOURCE_TYPE})

declareVirtualField({model:'program', field: 'status', instance: 'String', enumValues: PROGRAM_STATUS})

USER_MODELS=['user', 'loggedUser']
USER_MODELS.forEach(model => {
  declareVirtualField({model, field: 'role', instance: 'String', enumValues: ROLES})
})

