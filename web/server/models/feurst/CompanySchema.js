const mongooseLeanVirtuals=require('mongoose-lean-virtuals')
const {CUSTOMER_ADMIN}=require('../../../utils/feurst/consts')
const BaseSchema = require('../others/CompanySchema')

const CompanySchema = BaseSchema.clone()
CompanySchema.add({
  group_shipping_allowed:{
    type: Boolean,
    default: false,
    required: true,
    // SHIPPING GROUP Hide functionality
    get: v => false,
  }
})

CompanySchema.virtual('administrator', {
  ref: 'user', // The Model to use
  localField: '_id', // Find in Model, where localField
  foreignField: 'company', // is equal to foreignField
  match: {roles: CUSTOMER_ADMIN},
  justOne: true,
})

CompanySchema.plugin(mongooseLeanVirtuals)

module.exports = CompanySchema
