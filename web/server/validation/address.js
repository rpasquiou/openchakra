const lodash=require('lodash')

const validateAddress = data => {
  let errors = {}

  if (lodash.isEmpty(data.address)) {
    errors.address='Une adresse est requise'
  }
  if (lodash.isEmpty(data.city)) {
    errors.city='Une ville est requise'
  }
  if (lodash.isEmpty(data.zip_code)) {
    errors.zip_code='Un code postal est requis'
  }
  if (lodash.isEmpty(data.country)) {
    errors.country='Un pays est requis'
  }
  else {
    if (!['f','fr', 'france'].includes(data.country.toLowerCase().trim())) {
      errors.country='Expédition en France uniquement'
    }
  }

  return {
    errors,
    isValid: lodash.isEmpty(errors),
  }
}

module.exports=validateAddress
