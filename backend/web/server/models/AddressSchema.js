const {Schema}=require('mongoose')
const lodash=require('lodash')

const AddressSchema=new Schema({
  address: {
    type: String,
  },
  city: {
    type: String,
  },
  zip_code: {
    type: String,
  },
  country: {
    type: String,
  },
  region: {
    type: String,
  },
  latitude: {
    type: Number,
  },
  longitude: {
    type: Number,
  },
})

AddressSchema.virtual('text').get(function() {
  const {address, zip_code, city}=this
  return `${address||''}, ${zip_code || ''} ${city || ''}`
})

AddressSchema.methods.match = function(rhs) {

  const normalizeText= txt => {
    return txt && txt.replace(/\s/g, '') || txt
  }

  const labelRE=new RegExp(`^${normalizeText(this.label)}$`, 'i')
  const normalizeAddress = obj => {
    const FIELDS=['address', 'city', 'zip_code', 'country']
    return FIELDS.map(f => lodash.get(obj, f)).map(normalizeText).join(';')
  }

  const thisFieldsRE=new RegExp(`^${normalizeAddress(this)}$`, 'i')
  const rhsFields=normalizeAddress(rhs)

  const match=labelRE.test(normalizeText(rhs.label)) || thisFieldsRE.test(rhsFields)
  return match
}

AddressSchema.plugin(require('mongoose-lean-virtuals'))

module.exports=AddressSchema
